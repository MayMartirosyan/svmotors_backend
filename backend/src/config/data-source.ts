import { DataSource } from "typeorm";
import dotenv from "dotenv";

dotenv.config();

const isDev = process.env.NODE_ENV !== "production"

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [__dirname + `/../entities/*.${isDev ? "ts" : 'js'}`],
  migrations: [__dirname + `/../migrations/*.${isDev ? "ts" : 'js'}`],
  subscribers: [__dirname + `/../subscribers/*.${isDev ? "ts" : 'js'}`],
  synchronize: true,
  logging: isDev,
});
