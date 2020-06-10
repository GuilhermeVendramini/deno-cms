import database from "./database.ts";

try {
  await database.execute(`
  CREATE TABLE IF NOT EXISTS 
    users (
      id INTEGER PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(100) NOT NULL,
      password VARCHAR(255) NOT NULL
  )`);
} catch (error) {
  console.log(error);
}

await database.close();

console.log("Installation completed. Press Ctrl + c");
