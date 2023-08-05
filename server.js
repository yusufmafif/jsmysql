const express = require("express")
const mysql = require("mysql")
const bodyParser = require("body-parser")

const app = express()

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json());


app.set("view engine", "ejs")
app.set("views", "views")

const db = mysql.createConnection({
    host: "localhost",
    database: "belajardb",
    user: "root",
    password: "",
})

db.connect((err) => {
    if (err) throw err
    console.log("DB Connected")


    app.get("/", (req, res) => {
        const sql = "SELECT * FROM rpul"
        db.query(sql, (err, result) => {
            const users = JSON.parse(JSON.stringify(result))
            res.render("index", { users: users, title: "Belajar CRUD" })
        })
    })
    
    app.get("/edit/:id", (req, res) => {
        const id = req.params.id;
        const selectSql = `SELECT * FROM rpul WHERE id = ${id};`;
        db.query(selectSql, (err, result) => {
          if (err) throw err;
          const dataToEdit = JSON.parse(JSON.stringify(result[0]));
          res.render("edit", { dataToEdit: dataToEdit });
        });
      });

      app.post('/update/:id', (req, res) => {
        const id = req.params.id;
        const updateSql = `UPDATE rpul SET no='${req.body.no}', nama_lengkap='${req.body.nama}', umur='${req.body.umur}', premis='${req.body.premis}' WHERE id = ${id};`;
        db.query(updateSql, (err, result) => {
            if (err) throw err;
            console.log('Data has been updated!');
            res.redirect('/');
        });
    });

    app.post("/tambah", (req, res) => {
        const insertSql = `INSERT INTO rpul (no, nama_lengkap, umur, premis) VALUES ('${req.body.no}', '${req.body.nama}', '${req.body.umur}', '${req.body.premis}');`
        db.query(insertSql, (err, result) => {
            if (err) throw err
            res.redirect("/")
        })
    })
    

    app.delete('/hapus', (req, res) => {
        const id = req.body.id;
        const deleteSql = `DELETE FROM rpul WHERE id = ${id};`;
        db.query(deleteSql, (err, result) => {
            if (err) throw err;
            console.log('Data has been deleted!');
            res.send({ message: 'Data has been deleted!' });
        });
    });
})


app.listen(8000, () => {
    console.log("Server ready...")
})
