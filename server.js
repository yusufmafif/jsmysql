const express = require("express")
const mysql = require("mysql")
const bodyParser = require("body-parser")

const app = express()

app.use(bodyParser.urlencoded({ extended: true}))

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

    app.post("/tambah", (req, res) => {
        const insertSql = `INSERT INTO rpul (no, nama_lengkap, umur, premis) VALUES ('${req.body.no}', '${req.body.nama}', '${req.body.umur}', '${req.body.premis}');`
        db.query(insertSql, (err, result) => {
            if (err) throw err
            res.redirect("/")
        })
    })

   
})


app.listen(8000, () => {
    console.log("Server ready...")
})
