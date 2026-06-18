import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import {relations} from "./schema.js";

export const db = drizzle({
  connection: {
    connectionString: process.env.POSTGRES_CONNECTION_URL,
    ssl: {
      rejectUnauthorized: false,
    }
  },
  relations: relations
});