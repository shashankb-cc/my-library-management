//Note: We can give a robust implementation using a validation lib such
//zod and then export the parsed object.
import "dotenv/config"
export interface AppEnv {
  DATABASE_URL: string;
}
export const AppEnvs = process.env as unknown as AppEnv;
