require("dotenv").config();
const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");
const session = require("cookie-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");

const app = express();

connectionString = process.env.DATABASE_URL || "";
const db = mysql.createConnection(connectionString);

// const hashedPassword = bcrypt.hashSync('password', 10); // Ganti 'password' dengan kata sandi yang ingin Anda gunakan
// const insertSql = `INSERT INTO users (username, password) VALUES ('john_doe', '${hashedPassword}');`
// db.query(insertSql, (err, result) => {
//     if (err) throw err
//     console.log('User added to database');
// });

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.set("view engine", "ejs");
app.set("views", "views");
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: "your_secret_key",
    resave: false,
    saveUninitialized: false,
  }),
);
app.use(passport.initialize());
app.use(passport.session());

// Passport Configuration
passport.use(
  new LocalStrategy((username, password, done) => {
    db.query(
      "SELECT * FROM users WHERE username = ?",
      [username],
      (err, rows) => {
        if (err) return done(err);
        if (!rows.length)
          return done(null, false, { message: "Incorrect username." });
        const user = rows[0];
        bcrypt.compare(password, user.password, (err, result) => {
          if (err) return done(err);
          if (!result)
            return done(null, false, { message: "Incorrect password." });
          return done(null, user);
        });
      },
    );
  }),
);
passport.serializeUser((user, done) => {
  done(null, user.id);
});
passport.deserializeUser((id, done) => {
  db.query("SELECT * FROM users WHERE id = ?", [id], (err, rows) => {
    done(err, rows[0]);
  });
});
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
}

db.connect((err) => {
  if (err) throw err;
  console.log("DB Connected");

  app.use(
    session({
      secret: "your_secret_key",
      resave: false,
      saveUninitialized: false,
    }),
  );

  app.use(flash()); // Use connect-flash middleware

  //   FAHAMI
  app.get("/", ensureAuthenticated, (req, res) => {
    const sql = "SELECT * FROM rpul ORDER by tanggal_lahir";
    db.query(sql, (err, result) => {
      if (err) throw err;
      const users = JSON.parse(JSON.stringify(result));
      res.render("index", {
        users: users,
        title: "Belajar CRUD",
        user: req.user,
      });
    });
  });

  app.get("/login", (req, res) => {
    res.render("login.ejs", { message: req.flash("error") }); // 'error' is the default key for flash messages
  });

  app.post(
    "/login",
    passport.authenticate("local", {
      successRedirect: "/", // Arahkan ke halaman setelah login berhasil
      failureRedirect: "/login", // Arahkan kembali ke halaman login jika login gagal
      failureFlash: true, // Aktifkan pesan flash kesalahan
    }),
  );

  app.get("/", (req, res) => {
      const sql = "SELECT * FROM rpul"
      db.query(sql, (err, result) => {
          const users = JSON.parse(JSON.stringify(result))
          res.render("index", { users: users, title: "Belajar CRUD" })
      })
  })

  app.get("/sort", (req, res) => {
    const username = req.query.username; // Dapatkan nilai parameter username dari query string
    const attribute = req.query.attribute; // Dapatkan nilai parameter attribute dari query string

    // Lakukan pengurutan data sesuai dengan atribut yang diberikan
    // Misalnya, jika attribute === 'no', Anda dapat mengambil data dari database dan mengurutkannya berdasarkan nomor

    // Setelah melakukan pengurutan, kembalikan data dalam format JSON
    const sortedData = res.json(sortedData); // Data yang sudah diurutkan
  });

  app.get("/edit/:id", (req, res) => {
    const id = req.params.id;
    const selectSql = `SELECT * FROM rpul WHERE id = ${id};`;
    db.query(selectSql, (err, result) => {
      if (err) throw err;
      const dataToEdit = JSON.parse(JSON.stringify(result[0]));
      res.render("edit", { dataToEdit: dataToEdit });
    });
  });

  app.post("/update/:id", (req, res) => {
    const id = req.params.id;
    const updateSql = `UPDATE rpul SET no='${req.body.no}', nama_lengkap='${req.body.nama}', umur='${req.body.umur}', premis='${req.body.premis}', tanggal_lahir='${req.body.tanggalLahir}' WHERE id = ${id};`;
    db.query(updateSql, (err, result) => {
      if (err) throw err;
      console.log("Data has been updated!");
      res.redirect("/");
    });
  });

  app.post("/tambah", (req, res) => {
    const insertSql = `INSERT INTO rpul (no, nama_lengkap, umur, premis, tanggal_lahir) VALUES ('${req.body.no}', '${req.body.nama}', '${req.body.umur}', '${req.body.premis}', '${req.body.tanggal_lahir}');`;
    db.query(insertSql, (err, result) => {
      if (err) throw err;
      res.redirect("/");
    });
  });

  app.delete("/hapus", (req, res) => {
    const id = req.body.id;
    const deleteSql = `DELETE FROM rpul WHERE id = ${id};`;
    db.query(deleteSql, (err, result) => {
      if (err) throw err;
      console.log("Data has been deleted!");
      res.send({ message: "Data has been deleted!" });
    });
  });
});

app.get("/search", (req, res) => {
  const { id, no, nama_lengkap, umur, premis, tanggal_lahir } = req.query;

  let query = "SELECT * FROM people WHERE 1";

  if (id) {
    query += ` AND id = ${mysql.escape(id)}`;
  }
  if (no) {
    query += ` AND no = ${mysql.escape(no)}`;
  }
  if (name) {
    query += ` AND name LIKE ${mysql.escape("%" + name + "%")}`;
  }
  if (birthdate) {
    const formattedBirthdate = moment(birthdate).format("YYYY-MM-DD");
    query += ` AND birthdate = ${mysql.escape(formattedBirthdate)}`;
  }
  if (age) {
    const currentYear = new Date().getFullYear();
    const birthYear = currentYear - age;
    query += ` AND birthdate >= ${mysql.escape(birthYear + "-01-01")}`;
  }

  connection.query(query, (error, results) => {
    if (error) {
      console.error("Error executing query:", error);
      return res.status(500).json({ error: "An error occurred" });
    }

    res.json(results);
  });
});

app.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      // Handle error if logout encounters a problem
      console.error(err);
      return res.redirect("/"); // You might want to redirect to an error page
    }
    // Successful logout
    res.redirect("/");
  });
});

app.listen(8000, () => {
  console.log("Server ready...");
});

// const express = require("express");
// const app = express();

// app.get("/", function (req, res) {
//   res.send("Jadi Rusak nya kayak nya ada di package.json sama url database nya");
// });

// app.listen(8000, () => {
//   console.log("Server ready...");
// });
