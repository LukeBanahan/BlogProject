const express = require('express');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const sanitizeHtml = require('sanitize-html');

const app = express();
const PORT = process.env.PORT || 3000;

const db = new sqlite3.Database('./db/blogdatabase.db');

// express config
app.use(express.urlencoded({ extended: true }));
app.use(session({ secret: 'password', resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
    res.locals.userId = req.session.userId;
    next();
  });

  // get all blogs from db where current userId = author
  const getUserBlogs = (userId, callback) => {
    const query = 'SELECT * FROM blogs WHERE author_id = ?';
    db.all(query, [userId], (err, blogs) => {
      if (err) {
        console.error(err);
        callback(err, null);
      } else {
        callback(null, blogs);
      }
    });
  };

app.set('view-engine', 'ejs')

app.get('/', (req, res) => {
    res.render('register.ejs')
})

app.get('/login', (req, res) => {
    res.render('login.ejs')
})

app.get('/register', (req, res) => {
    res.render('register.ejs')
})

app.get('/blogs', (req, res) => {
    res.render('blogs.ejs')
})

app.get('/new-blog', (req, res) => {
    res.render('new-blog.ejs')
})

app.get('/my-blogs', (req, res) => {
    const userId = req.session.userId;
  
    // get blogs belonging to this user id
    getUserBlogs(userId, (err, userBlogs) => {
      if (err) {
        return res.status(500).send('Internal Server Error');
      }
  
      // show this user's blogs
      res.render('my-blogs.ejs', { userBlogs });
    });
  });

  app.post('/register', (req, res) => {
    const { username, password } = req.body;

    // hash password
    bcrypt.hash(password, 10, (hashErr, hashedPassword) => {
        if (hashErr) {
            return res.status(500).send('Internal Server Error');
        }

        //  parameterized query to stop SQL Injection attacks
        const query = 'INSERT INTO users (username, password) VALUES (?, ?)';
        
        db.run(query, [username, hashedPassword], (err) => {
            if (err) {
                return res.status(500).send('Internal Server Error');
            }

            console.log(`Registration successful ${username}`);
            res.redirect('/login');
        });
    });
});


app.post('/login', (req, res) => {
  const { username, password } = req.body;

  // parameterized query to protect  against SQL injection
  const query = 'SELECT * FROM users WHERE username = ?';

  db.get(query, [username], (err, user) => {
      if (err) {
          return res.status(500).send('Internal Server Error');
      }

      if (user) {
          // check hashed password  
          bcrypt.compare(password, user.password, (compareErr, match) => {
              if (compareErr) {
                  return res.status(500).send('Internal Server Error');
              }

              if (match) {
                  // successful login
                  req.session.userId = user.id;
                  req.session.username = user.username;
                  res.redirect('/blogs');
                  console.log(`Login successful: ${username}`);
                  console.log(`New session started for user: ${username}`);
              } else {
                  // invalid password
                  res.status(401).send('Invalid username or password');
              }
          });
      } else {
          // user not found
          res.status(401).send('Invalid username or password');
      }
  });
});
app.post('/create-blog', (req, res) => {
  const { title, content } = req.body;
  const authorId = req.session.userId;

  // sanitize inputs to stop XSS
  const sanitizedTitle = sanitizeHtml(title);
  const sanitizedContent = sanitizeHtml(content);

  //parameterized query
  const query = 'INSERT INTO blogs (title, content, author_id) VALUES (?, ?, ?)';
  const values = [sanitizedTitle, sanitizedContent, authorId];

  db.run(query, values, function (err) {
      if (err) {
          console.error(err);
          return res.status(500).send('Internal Server Error');
      }

      // success
      console.log('New blog created successfully');
      res.redirect('/blogs');
  });
});

  

// start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });