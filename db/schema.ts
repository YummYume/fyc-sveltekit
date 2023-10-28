import Database from 'bun:sqlite';

const args = Bun.argv;
const db = new Database('db.sqlite', { create: true });

if (args.includes('--clear-db')) {
  db.run(`
    DROP TABLE IF EXISTS user;
    DROP TABLE IF EXISTS user_key;
    DROP TABLE IF EXISTS user_session;
  `);
}

// user
db.run(`
  CREATE TABLE IF NOT EXISTS user (
    id TEXT NOT NULL PRIMARY KEY,
    username TEXT NOT NULL UNIQUE
  );
`);

// user_key
db.run(`
  CREATE TABLE IF NOT EXISTS user_key (
    id TEXT NOT NULL PRIMARY KEY,
    user_id TEXT NOT NULL,
    hashed_password TEXT,
    FOREIGN KEY (user_id) REFERENCES user(id)
  );
`);

// user_session
db.run(`
  CREATE TABLE IF NOT EXISTS user_session (
    id TEXT NOT NULL PRIMARY KEY,
    user_id TEXT NOT NULL,
    active_expires INTEGER NOT NULL,
    idle_expires INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES user(id)
  );
`);

db.close();
