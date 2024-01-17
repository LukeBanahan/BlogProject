// authRoutes.js
const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();

// Initialize SQLite database
const db = new sqlite3.Database('./db/blogdatabase.db'); // Update to match your database filename

// Registration route
router.post('/register', (req, res) => {
  const { username, password } = req.body;

  // Insert the new user into the database
  const insertUserQuery = 'INSERT INTO users (username, password) VALUES (?, ?)';
  
  db.run(insertUserQuery, [username, password], (err) => {
    if (err) {
      return res.status(500).send('Internal Server Error');
    }

    // Redirect or respond as needed
    res.redirect('/login');
  });
});

module.exports = router;