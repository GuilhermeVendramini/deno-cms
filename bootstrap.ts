import {
  Application,
} from "oak";
import { config } from "dotenv";
import "dotenv/load";
import database from "./database.ts";

const env = config();
const PORT: number = parseInt(env.PORT) || 8000;
const HOST: string = env.HOST || "127.0.0.1";
const app = new Application();

export { env, PORT, HOST, app, database };
