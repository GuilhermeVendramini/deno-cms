import database from "./database.ts";
import * as Colors from "https://deno.land/std/fmt/colors.ts";

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
  console.error(Colors.green(error));
}

await database.close();

console.info(
  Colors.green(
    "🦕 Installation completed. Press 'Ctrl + c' and run 'denon start' 🦕",
  ),
);
