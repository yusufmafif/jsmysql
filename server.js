const express = require("express")
const mysql = require("mysql")

const app = express()

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

    const sql = "SELECT * FROM rpul"
    db.query(sql, (err, result) => {
        const users = JSON.parse(JSON.stringify(result))
        console.log('hasil database', users)
        app.get("/", (req, res) => {
            res.render("index", { users: users, title: "TEST"})
        })
    })
})


app.listen(8000, () => {
    console.log("Server ready...")
})
