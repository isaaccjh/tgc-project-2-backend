const express = require("express");
const app = express();

const cors = require("cors");

// ENABLE PROCESSING JSON DATA
app.use(express.json());
// ENABLE CORS
app.use(cors());

require("dotenv").config();
const MongoUri = process.env.URI

const MongoClient = require("mongodb").MongoClient;


async function connect() {
    const client = await MongoClient.connect(MongoUri,{"useUnifiedTopology": true});

    const db = client.db("cocktail");

    // app.get("/", (req, res) => {
    //     res.send("<h1>Conneted to express</h1>")
    // });
    
    app.get("/", async function(req,res) {
        const ingredients = await db.collection("ingredients_collection").find({}).limit(10).toArray();
        res.json(ingredients);
    })
}

connect();

app.listen(5500, ()  => {
    console.log("Server has started");
})

