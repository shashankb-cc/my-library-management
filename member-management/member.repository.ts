import { ResultSetHeader, RowDataPacket } from "mysql2";
import {
  generateCountSql,
  generateDeleteSql,
  generateInsertSql,
  generateSelectSql,
  generateUpdateSql,
} from "../libs/mysql-query-generator.";
import { WhereExpression } from "../libs/types";
import { IPageRequest, IPagesResponse } from "../core/pagination";
import { IRepository } from "../core/repository";
import { IMemberBase, IMember } from "./models/member.model";
import { MySqlConnectionPoolFactory } from "../db/mysql-adapter";
import { DBConfig } from "../db/mysql-db";
import { AppEnvs } from "../read-env";

const config: DBConfig = {
  dbURL: AppEnvs.DATABASE_URL,
};

export class MemberRepository implements IRepository<IMemberBase, IMember> {
  constructor(private poolFactory: MySqlConnectionPoolFactory) {}

  async create(data: IMemberBase): Promise<IMember | undefined> {
    let connection;
    try {
      const insertQuery = generateInsertSql<IMemberBase>("members", data);
      connection = await this.poolFactory.acquireConnection();
      connection.initialize();
      const result = await connection?.query<ResultSetHeader>(
        insertQuery.sql,
        insertQuery.data
      );
      if (result) {
        const insertedMemberId = result.insertId;
        const insertedMember = await this.getById(insertedMemberId);
        return insertedMember as IMember;
      }
    } catch (error) {
      throw error;
    } finally {
      if (connection) {
        await connection.release();
      }
    }
  }

  async update(
    id: number,
    data: Partial<IMember>
  ): Promise<IMember | undefined> {
    let connection;
    try {
      const updateQuery = generateUpdateSql<IMember>("members", data, {
        id: { value: id, op: "EQUALS" },
      });
      connection = await this.poolFactory.acquireConnection();
      const result = await connection.query<ResultSetHeader>(
        updateQuery.sql,
        updateQuery.data
      );
      if (result) {
        const updatedMember = await this.getById(id);
        return updatedMember as IMember;
      }
    } catch (error) {
      throw error;
    } finally {
      if (connection) {
        await connection.release();
      }
    }
  }

  async delete(id: number): Promise<IMember | undefined> {
    let connection;
    try {
      const deletedMember = await this.getById(id);
      const deleteQuery = generateDeleteSql<IMember>("members", {
        id: { value: id, op: "EQUALS" },
      });
      connection = await this.poolFactory.acquireConnection();
      const result = await connection.query<ResultSetHeader>(
        deleteQuery.sql,
        deleteQuery.data
      );
      if (result && result.affectedRows > 0) {
        return deletedMember as IMember;
      }
    } catch (error) {
      throw error;
    } finally {
      if (connection) {
        await connection.release();
      }
    }
  }

  async list(
    params: IPageRequest
  ): Promise<IPagesResponse<IMember> | undefined> {
    let connection;
    try {
      const { limit, offset, search } = params;
      const searchFilter: WhereExpression<IMember> = search
        ? {
            OR: [
              { firstName: { value: search, op: "CONTAINS" } },
              { lastName: { value: search, op: "CONTAINS" } },
              { email: { value: search, op: "CONTAINS" } },
            ],
          }
        : {};

      const totalCount = await this.getTotalCount(searchFilter);
      if (!totalCount) throw new Error("Could not fetch the count");

      const selectQuery = generateSelectSql<IMember>(
        "members",
        searchFilter,
        offset,
        limit,
        []
      );
      connection = await this.poolFactory.acquireConnection();
      const result = await connection.query<RowDataPacket[]>(
        selectQuery.sql,
        selectQuery.data
      );
      if (result) {
        return {
          items: result as IMember[],
          pagination: { offset, limit, total: totalCount },
        };
      }
    } catch (error) {
      throw error;
    } finally {
      if (connection) {
        await connection.release();
      }
    }
  }

  async deleteAll() {
    let connection;
    try {
      const deleteQuery = generateDeleteSql<IMember>("members", {});
      connection = await this.poolFactory.acquireConnection();
      const result = await connection.query<ResultSetHeader>(
        deleteQuery.sql,
        deleteQuery.data
      );
      if (result && result.affectedRows > 0) {
        return result.affectedRows;
      }
    } catch (error) {
      throw error;
    } finally {
      if (connection) {
        await connection.release();
      }
    }
  }

  async getTotalCount(
    where: WhereExpression<IMember>
  ): Promise<number | undefined> {
    let connection;
    try {
      const countQuery = generateCountSql("members", where);
      connection = await this.poolFactory.acquireConnection();
      const result = await connection.query<RowDataPacket[]>(
        countQuery.sql,
        countQuery.data
      );
      if (result) return result[0]["COUNT(*)"] as number;
    } catch (error) {
      throw error;
    } finally {
      if (connection) {
        await connection.release();
      }
    }
  }

  async getById(id: number): Promise<IMember | undefined> {
    let connection;
    try {
      const selectQuery = generateSelectSql<IMember>(
        "members",
        { id: { value: id, op: "EQUALS" } },
        0,
        1,
        []
      );
      connection = await this.poolFactory.acquireConnection();
      const result = await connection.query<RowDataPacket[]>(
        selectQuery.sql,
        selectQuery.data
      );
      if (result) return result[0] as IMember;
    } catch (error) {
      throw error;
    } finally {
      if (connection) {
        await connection.release();
      }
    }
  }
}
