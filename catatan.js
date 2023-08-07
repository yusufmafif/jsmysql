const express = require('express');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const mysql = require('mysql2');
const bcrypt = require('bcrypt');

const app = express();

// Konfigurasi MySQL
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'username',
  password: 'password',
  database: 'dbname'
});

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(session({ secret: 'your_secret_key', resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

// Passport Configuration
passport.use(new LocalStrategy(
  (username, password, done) => {
    connection.query('SELECT * FROM users WHERE username = ?', [username], (err, rows) => {
      if (err) return done(err);
      if (!rows.length) return done(null, false, { message: 'Incorrect username.' });
      
      const user = rows[0];
      bcrypt.compare(password, user.password, (err, result) => {
        if (err) return done(err);
        if (!result) return done(null, false, { message: 'Incorrect password.' });
        return done(null, user);
      });
    });
  }
));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  connection.query('SELECT * FROM users WHERE id = ?', [id], (err, rows) => {
    done(err, rows[0]);
  });
});

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
}


// Routes
app.get('/', ensureAuthenticated, (req, res) => {
  res.render('index.ejs', { user: req.user });
});


app.get('/login', (req, res) => {
  res.render('login.ejs', { message: req.flash('loginMessage') });
});

app.post('/login', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login',
  failureFlash: true
}));

app.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

app.listen(3000, () => {
  console.log('Server started on http://localhost:3000');
});
