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

// TO DO: FILTER INGREDIENTS BY NAME
async function ingredients() {
    const client = await MongoClient.connect(MongoUri, { "useUnifiedTopology": true });

    const db = client.db("cocktail");

    app.get("/cocktails/ingredients", async function (req, res) {

        const filter = {}

        const ingredients = await db.collection("ingredients_collection").find(filter).toArray();
        res.json(ingredients);
    })
};

ingredients();

// TO DO: FILTER POSTS BY USER, BY AVERAGE REVIEWS
async function posts() {
    const client = await MongoClient.connect(MongoUri, { "useUnifiedTopology": true });

    const db = client.db("cocktail");

    // GET ALL COCKTAILS [READ]
    app.get("/cocktails", async function (req, res) {
        // FOR SEARCH FILTER
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
                    "likes": 0,
                    "name": req.body.name,
                    "preparation": req.body.preparation,
                    "saved": 0,
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
    app.put("/cocktails/:post_id", validatePost, async function (req, res) {
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
    app.delete("/cocktails/:post_id", async function (req, res) {
        const result = await db.collection("cocktail_collection")
            .deleteOne({
                "_id": new ObjectId(req.params.post_id)
            })
        res.json({
            "result": result
        })
    })
};

posts();

// TO DO: ALLOW FOR SEARCH BY USERNAME
async function users() {
    const client = await MongoClient.connect(MongoUri, { "useUnifiedTopology": true });

    const db = client.db("cocktail");

    // GET ALL USERS [READ]
    app.get("/users", async function (req, res) {
        const users = await db.collection("user_collection")
            .find({}).toArray();
        res.json(users);
    })

    // NEW USER REGISTRATION [CREATE]
    app.post("/users/register", async function (req, res) {
        try {
            const result = await db.collection("user_collection").insertOne({
                "name": req.body.name,
                "dateOfBirth": req.body.dateOfBirth,
                "email": req.body.email,
                "gender": req.body.gender,
                "country": req.body.country,
                "password": req.body.password,
                "savedRecipes": [],
                "posts": 0,
                "username": req.body.username,
                "dateJoined": new Date()
            });
            res.json({
                "result": result
            })
        } catch (e) {
            console.log(e)
            res.status(500);
            res.json({
                "error": "Database not available. Please try again later or contact the developer of this API."
            })
        }
    })

    // UPDATE PROFILE [UPDATE]
    app.put("/users/edit/:user_id", async function (req, res) {
        const userId = req.params.user_id;
        try {
            const updateUser = await db.collection("user_collection").updateOne({
                "_id": new ObjectId(userId)
            }, {
                "$set": {
                    "name": req.body.name,
                    "dateOfBirth": req.body.dateOfBirth,
                    "username": req.body.username,
                    "email": req.body.email,
                    "gender": req.body.gender,
                    "country": req.body.country,
                    "password": req.body.password,
                    "savedRecipes": req.body.savedRecipes,
                    "posts": req.body.posts,
                    "dateJoined": req.body.dateJoined
                }
            });
            res.json({
                "result": updateUser
            })
        } catch (e) {
            console.log(e)
            res.status(500);
            res.json({
                "error": "Database not available. Please try again later or contact the developer of this API."
            });
        }
    })

    // DELETE PROFILE [DELETE]
    app.delete("/users/delete/:user_id", async function (req, res) {
        const deleted = await db.collection("user_collection").deleteOne({
            "_id": new ObjectId(req.params.user_id)
        });
        res.json({
            "result": deleted
        })
    })
};

users();

// TO DO:
async function reviews() {
    const client = await MongoClient.connect(MongoUri, { "useUnifiedTopology": true });

    const db = client.db("cocktail");

    app.get("/cocktails/:post_id/reviews", async function (req, res) {
        try {
            const postId = new ObjectId(req.params.post_id)
            const filter = { "cocktailId": postId }

            const result = await db.collection("reviews_collection").find(filter).toArray();
            res.json(result);

        } catch (e) {
            console.log(e);
        }
    })


}

reviews();




app.listen(5500, () => {
    console.log("Server has started");
})



