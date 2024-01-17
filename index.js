

// Set up SQLite database and create tables
const db = new sqlite3.Database('./db/blogdatabase.db');

// Create a table for users
db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    username TEXT,
    password TEXT
  )
`);

// Create a table for blog posts
db.run(`
  CREATE TABLE IF NOT EXISTS blogs (
    id INTEGER PRIMARY KEY,
    title TEXT,
    content TEXT,
    author_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES users(id)
  )
`);

// Close the database connection
db.close();



