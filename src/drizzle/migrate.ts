import "dotenv/config";
import { drizzle } from "drizzle-orm/mysql2";
import { migrate } from "drizzle-orm/mysql2/migrator";
import mysql from "mysql2/promise";
import { AppEnvs } from "../../read-env";
import { books, members, transactions } from "./schema";

//Database URL
const databaseURL = AppEnvs.DATABASE_URL;
//connection for migration
const migrationClient = mysql.createPool({
  uri: databaseURL,
  multipleStatements: true,
});
//perform migration below

async function migrateDB() {
  await migrate(drizzle(migrationClient), {
    migrationsFolder: "/home/shashankb/1-in-memory/src/drizzle/migration", // Adjust this path to your migrations folder src/drizzle/migration
  });
  await migrationClient.end();
}
migrateDB();
