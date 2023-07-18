const express = require('express');
const mysql = require('mysql');

const app = express();

app.get("/", (req, res) => {
    res.send("OK ROUTE OPEN");
});

app.listen(8000, () => {
    console.log("Server ready...");
});
