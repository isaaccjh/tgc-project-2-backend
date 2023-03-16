// REQUIRE EXPRESS
const express = require("express");
const app = express();

// REQUIRE CORS
const cors = require("cors");

// VALIDATIONS
const validatePost = require("./validatePost");

// MONGO
const { ObjectId } = require("mongodb");
const MongoClient = require("mongodb").MongoClient;

// ENABLE PROCESSING JSON DATA
app.use(express.json());
// ENABLE CORS
app.use(cors());

// URI TO STORE MONGO URI
require("dotenv").config();
const MongoUri = process.env.URI


async function connect() {
    const client = await MongoClient.connect(MongoUri, { "useUnifiedTopology": true });

    const db = client.db("cocktail");
    
    // GET ALL COCKTAILS [READ]
    app.get("/cocktails", async function (req, res) {
        const filter = {};
        
        if (req.query.name) {
            filter["name"] = req.query.name;
        };

        if (req.query.glassType) {
            filter["glassType"] = req.query.glassType;
        }

        if (req.query.distinction) {
            filter["distinctions"] = {
                "$regex": req.query.distinction,
                "$options": "i"
            }
        }

        const cocktail = await db.collection("cocktail_collection").find(filter).limit(2).toArray();
        res.json(cocktail);

    });

    // POST NEW COCKTAIL [CREATE]
    app.post("/cocktails/new-post", validatePost, async function (req, res) {
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
    });

    // EDIT COCKTAIL POST [UPDATE]
    app.put("/cocktails/:post_id", validatePost, async function(req,res) {
        const postId = req.params.post_id;
        const updated = await db.collection("cocktail_collection")
                .updateOne({
                    "_id": new ObjectId(postId)
                }, {
                    "$set": {
                        "userId": req.body.userId,
                        "alcoholic": req.body.alcoholic,
                        "distinctions": req.body.distinctions,
                        "glassType": req.body.glassType,
                        "imageUrl": req.body.imageUrl,
                        "likes": req.body.likes,
                        "name": req.body.name,
                        "preparation": req.body.preparation,
                        "saved": req.body.saved,
                        "dateAdded": req.body.dateAdded
                    }
                });
        res.json({
            "result": updated
        })
    });

    // DELETE COCKTAIL POST [DELETE]
    app.delete("/cocktails/:post_id", async function(req,res) {
        const result = await db.collection("cocktail_collection")
                .deleteOne({
                    "_id": new ObjectId(req.params.post_id)
                })
        res.json({
            "result": result
        })
    })
}

connect();

app.listen(3000, () => {
    console.log("Server has started");
})



