const MongoClient = require("mongodb").MongoClient;
const cors = require("cors")
require("dotenv").config();

const MongoUri = process.env.URI

const express = require("express");
const app = express();

async function connect() {
    const client = await MongoClient.connect(MongoUri,{"useUnifiedTopology": true});

    const db = client.db("cocktail");
    return db;
}




app.get("/", (req, res) => {
    res.send("<h1>Conneted to express</h1>")
})





app.listen(5500, () => {
    console.log("Server has started");
})

