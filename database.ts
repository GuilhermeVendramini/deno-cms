import Dexecutor from "dexecutor";

const database = new Dexecutor({
  client: "sqlite3",
  connection: {
    filename: "denocms.db",
  },
});

await database.connect();

export default database;
