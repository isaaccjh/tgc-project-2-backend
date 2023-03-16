const express = require("express");
const app = express();

const cors = require("cors");

// VALIDATION 
const validatePost = require("./validatePost");

// ENABLE PROCESSING JSON DATA
app.use(express.json());
// ENABLE CORS
app.use(cors());

require("dotenv").config();
const MongoUri = process.env.URI

const MongoClient = require("mongodb").MongoClient;


async function connect() {
    const client = await MongoClient.connect(MongoUri, { "useUnifiedTopology": true });

    const db = client.db("cocktail");

    app.get("/", async function (req, res) {
        const cocktail = await db.collection("cocktail_collection").find({}).limit(2).toArray();
        res.json(cocktail);
    })

    app.post("/new-post", validatePost, async function (req, res) {
        try {
            const result = await db.collection("cocktail_collection")
                .insertOne({
                    "userId": req.body.userId,
                    "alcoholic": req.body.alcoholic,
                    "distinctions": req.body.distinctions,
                    "glassType": req.body.glassType,
                    "imageUrl": req.body.imageUrl,
                    "likes": req.body.likes,
                    "name": req.body.name,
                    "preparation": req.body.preparation,
                    "saved": req.body.saved,
                    "dateAdded": new Date()
                });
            res.json({
                "result": result
            });
        } catch (e) {
            res.status(500);
            res.json({
                "error": "Database not available. Please try again later or contact the developer of this API."
            })
        }
    })
}

connect();

app.listen(5500, () => {
    console.log("Server has started");
})



