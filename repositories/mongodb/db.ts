import { env } from "../../bootstrap.ts";
import { MongoClient } from "mongo";
const client = new MongoClient();
const DB = client.database(env.DATABASE_NAME);

client.connectWithUri(env.MONGO_DB);

export default DB;
