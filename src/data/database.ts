import { Database } from "bun:sqlite";

export const db = new Database(":memory:", { create: true });
export const initializeDb = () => {
  db.run(
    `CREATE TABLE IF NOT EXISTS articles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        published_at DATETIME NOT NULL,
        author TEXT NOT NULL,
        is_published INTEGER NOT NULL
    )`
  );

  db.run(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        password TEXT NOT NULL
    )`);

  console.log("database up and running");
};
