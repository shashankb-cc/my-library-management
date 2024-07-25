import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { AppEnvs } from "../../read-env";
export function getDrizzleDB() {
  const pool = mysql.createPool(AppEnvs.DATABASE_URL);
  const db = drizzle(pool);
  return db;
}
