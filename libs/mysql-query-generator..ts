import {
  AndWhereExpression,
  ColumnData,
  InsertColumnSet,
  NestedQuery,
  OrWhereExpression,
  SimpleWhereExpression,
  UpdateColumnSet,
  WhereExpression,
  WhereParamValue,
} from "./types";

interface IQuery {
  sql: string;
  data: any[];
}
const processSimpleExp = <T>(exp: SimpleWhereExpression<T>): IQuery => {
  const data: ColumnData[] = [];
  let sql = Object.entries(exp)
    .map(([key, opts]) => {
      const columnName = `\`${key}\``;
      const paramValue: WhereParamValue = opts as WhereParamValue;
      let value = paramValue.value;
      let operator = "";
      if (value === null) {
        operator = paramValue.op === "EQUALS" ? " IS " : " IS NOT ";
      } else if (Array.isArray(value)) {
        if (paramValue.op === "IN" || paramValue.op === "NOT_IN") {
          operator = paramValue.op === "IN" ? " IN " : " NOT IN ";
          data.push(...value);
          const placeholders = value.map(() => "?").join(", ");

          return `${columnName}${operator}(${placeholders})`;
        }
      } else if (typeof value === "object") {
        const nestedQuery = value as NestedQuery<T>;
        const selectQuery = generateSelectSql(
          nestedQuery.tableName,
          nestedQuery.where
        );
        operator = paramValue.op === "IN" ? " IN " : " NOT IN ";
        data.push(...selectQuery.data);
        return `${columnName}${operator}(${selectQuery.sql})`;
      } else {
        switch (paramValue.op) {
          case "EQUALS":
            operator = " = ";
            data.push(value);
            value = "?";
            break;
          case "NOT_EQUALS":
            operator = " != ";
            data.push(value);
            value = "?";
            break;
          case "STARTS_WITH":
            operator = " LIKE ";
            data.push(`${value}%`);
            value = "?";
            break;
          case "NOT_STARTS_WITH":
            operator = " NOT LIKE ";
            data.push(`${value}%`);
            value = "?";
            break;
          case "ENDS_WITH":
            operator = " LIKE ";
            data.push(`%${value}`);
            value = "?";
            break;
          case "NOT_ENDS_WITH":
            operator = " NOT LIKE ";
            data.push(`%${value}`);
            value = "?";
            break;
          case "CONTAINS":
            operator = " LIKE ";
            data.push(`%${value}%`);
            value = "?";
            break;
          case "NOT_CONTAINS":
            operator = " NOT LIKE ";
            data.push(`%${value}%`);
            value = "?";
            break;
          case "GREATER_THAN":
            operator = " > ";
            data.push(value);
            value = "?";
            break;
          case "GREATER_THAN_EQUALS":
            operator = " >= ";
            data.push(value);
            value = "?";
            break;
          case "LESSER_THAN":
            operator = " < ";
            data.push(value);
            value = "?";
            break;
          case "LESSER_THAN_EQUALS":
            operator = " <= ";
            data.push(value);
            value = "?";
            break;
        }
      }
      return `${columnName}${operator}${value}`;
    })
    .join(" AND ");
  sql = `(${sql})`;
  return { sql, data };
};

export const generateWhereClauseSql = <T>(
  whereParams: WhereExpression<T>
): IQuery => {
  const whKeys = Object.keys(whereParams);

  if (whKeys.includes("AND")) {
    const andClause = (whereParams as AndWhereExpression<T>).AND.map((exp) =>
      generateWhereClauseSql(exp)
    )
      .filter((c) => c.sql)
      .map((c) => c.sql)
      .join(" AND ");

    const data = (whereParams as AndWhereExpression<T>).AND.flatMap(
      (exp) => generateWhereClauseSql(exp).data
    );

    return {
      sql: andClause ? `(${andClause})` : "",
      data,
    };
  } else if (whKeys.includes("OR")) {
    const orClause = (whereParams as OrWhereExpression<T>).OR.map((exp) =>
      generateWhereClauseSql(exp)
    )
      .filter((c) => c.sql)
      .map((c) => c.sql)
      .join(" OR ");

    const data = (whereParams as OrWhereExpression<T>).OR.flatMap(
      (exp) => generateWhereClauseSql(exp).data
    );

    return {
      sql: orClause ? `(${orClause})` : "",
      data,
    };
  } else {
    return processSimpleExp(whereParams as SimpleWhereExpression<T>);
  }
};

export const generateInsertSql = <T>(
  tableName: string,
  row: InsertColumnSet<T>
): IQuery => {
  let data: ColumnData[] = [];
  let rowPlaceHolder: string[] = [];

  const columns = Object.keys(row)
    .map((column) => `\`${column}\``)
    .join(",");

  Object.entries(row).forEach(([key, value]) => {
    let insertValue: ColumnData = value as ColumnData;
    data.push(insertValue);
    rowPlaceHolder.push("?");
  });

  const placeHolder = rowPlaceHolder.join(",");
  const sql = `INSERT INTO \`${tableName}\` (${columns}) VALUES (${placeHolder})`;

  return { sql, data };
};

export const generateUpdateSql = <T>(
  tableName: string,
  row: UpdateColumnSet<T>,
  where: WhereExpression<T>
): IQuery => {
  const data: ColumnData[] = [];
  const placeHolder: string[] = [];

  // Generate SET clause for update values
  Object.entries(row).forEach(([key, value]) => {
    let updateValue: ColumnData = value as ColumnData;
    data.push(updateValue);
    placeHolder.push(`${key} = ?`);
  });

  const placeholdersString = placeHolder.join(", ");
  let sql = `UPDATE \`${tableName}\` SET ${placeholdersString}`;

  // Append WHERE clause if provided
  if (Object.keys(where).length > 0) {
    const whereClause = generateWhereClauseSql<T>(where);
    data.push(...whereClause.data);
    sql += " WHERE " + whereClause.sql;
  }

  return { sql, data };
};

export const generateDeleteSql = <T>(
  tableName: string,
  where: WhereExpression<T>
): IQuery => {
  const data: ColumnData[] = [];
  let sql = `DELETE FROM \`${tableName}\``;
  if (Object.keys(where).length) {
    const whereClause = generateWhereClauseSql<T>(where);
    data.push(...whereClause.data);
    sql += " WHERE " + whereClause.sql;
  }
  return { sql, data };
};
export const generateSelectSql = <T>(
  tableName: string,
  where: WhereExpression<T>,
  offset?: number,
  limit?: number,
  fieldToSelect?: Partial<keyof T>[]
): IQuery => {
  let sql = `SELECT `;
  let columns: string[] = [];
  const data: ColumnData[] = [];
  if (fieldToSelect?.length) {
    columns = fieldToSelect.map((field) => `\`${field.toString()}\``);
    sql += ` ${columns.join(",")} `;
  } else {
    sql += ` * `;
  }

  sql += `FROM \`${tableName}\``;
  if (Object.keys(where).length) {
    const whereClause = generateWhereClauseSql<T>(where);
    data.push(...whereClause.data);
    sql += ` WHERE ${whereClause.sql} `;
  }
  if (limit) {
    sql += `LIMIT ${limit} `;
  }
  if (offset! >= 0) {
    sql += ` OFFSET ${offset} `;
  }

  console.dir(sql);
  return { sql, data };
};
export const generateCountSql = <T>(
  tableName: string,
  where: WhereExpression<T>,
  columnName?: keyof T
): IQuery => {
  const data: ColumnData[] = [];
  let sql = "SELECT COUNT(*) ";

  sql += `FROM  \`${tableName}\``;

  if (Object.keys(where).length) {
    const whereClause = generateWhereClauseSql<T>(where);
    data.push(...whereClause.data);
    sql += ` WHERE ${whereClause.sql}`;
  }
  return { sql, data };
};

export const MySqlQueryGenerator = {
  generateWhereClauseSql,
  generateInsertSql,
  generateUpdateSql,
  generateDeleteSql,
  generateSelectSql,
  generateCountSql,
};

export { WhereExpression };
