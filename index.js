// REQUIRE EXPRESS
const express = require("express");
const app = express();

// REQUIRE CORS
const cors = require("cors");

// REQUIRE JWT
const jwt = require("jsonwebtoken");


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

// ROUTE TO GENERATE JWT

const generateAccessToken = (id, email) => {
    return jwt.sign({
        "user_id": id,
        "email": email
    })
}

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

// INGREDIENTS USAGE
async function ingredient_usage() {
    const client = await MongoClient.connect(MongoUri, { "useUnifiedTopology": true });

    const db = client.db("cocktail");

    app.get("/cocktails/ingredients-used", async function (req, res) {

        const filter = {}

        const ingredientsUsed = await db.collection("ingredient_usage").find(filter).toArray();

        res.json(ingredientsUsed);
    })
}

ingredient_usage();

// TO DO: FILTER POSTS BY USER, BY AVERAGE REVIEWS
async function posts() {
    const client = await MongoClient.connect(MongoUri, { "useUnifiedTopology": true });

    const db = client.db("cocktail");

    // GET ALL COCKTAILS [READ]
    app.get("/cocktails", async function (req, res) {
        // FOR SEARCH FILTER

        /*SEARCH INGREDIENT STEPS:
        1. FIND OUT INGREDIENT ID THAT IS BEING SEARCHED 
        2. MATCH INGREDIENT IN INGREDIENT COLLETION
        3. FIND ALL COCKTAIL ID THAT MATCHES INGREDIENT ID IN INGREDIENT_USAGE COLLECTION
        4. MATCH IT WITH THE REST OF THE SEARCH FILTERS*/

        const filter = {};


        if (req.query.name) {
            filter["name"] = {
                "$regex": req.query.name,
                "$options": "i"
            }
        };

        if (req.query.alcoholic) {
            filter["alcoholic"] = {
                "$regex": req.query.alcoholic,
                "$options": "i"
            }
        }

        if (req.query.glassType) {
            filter["glassType"] = {
                "$regex": req.query.glassType,
                "$options": "i"
            }
        }

        if (req.query.distinction) {
            query = Array.isArray(req.query.distinction) ? req.query.distinction : [req.query.distinction]

            filter["distinctions"] = {
                "$all": query
            }
        }

        // FIND INGREDIENT ID
        if (req.query.ingredient) {
            const searchedIngredient = await db.collection("ingredients_collection")
                .findOne({
                    name: req.query.ingredient
                }, { _id: 1, name: 1 })

            // INGREDIENT ID OF SEARCHED INGREDIENT
            const searchedId = searchedIngredient?._id

            filter["ingredients"] = {
                $elemMatch: {
                    "ingredients.ingredientId.$oid": searchedId.toString()
                }
            }
        }

        // FIND COCKTAIL THAT USES INGREDIENT
        const cocktail = await db.collection("cocktail_collection").aggregate([
            {
                $lookup: {
                    from: "ingredient_usage",
                    localField: "_id",
                    foreignField: "cocktailId",
                    as: "ingredients"
                }
            }, {
                $match: filter
            }
        ]).toArray();

        res.json(cocktail);

    });

    app.get("cocktails/:post_id", async function (req, res) {
        try {
            const result = await db.collection("cocktail_collection")
                .find({
                    "_id": new ObjectId(req.params.post_id)
                })

            res.json(result);

        } catch (e) {
            res.status(500);
            res.json({
                "error": "Database not available. Please try again later or contact the developer of this API."
            })
        }
    })

    // POST NEW COCKTAIL [CREATE]
    app.post("/cocktails/new-post", async function (req, res) {
        if (!req.body.userId) {
            res.status(400).send("UserID required");
        }
        if (!req.body.alcoholic) {
            res.status(400).send("Alcoholic type required");
        }
        if (!req.body.distinctions) {
            res.status(400).send("Distinctions required");
        }
        if (!req.body.glassType) {
            res.status(400).send("Glass type required");
        }
        if (!req.body.imageUrl) {
            res.status(400).send("Image URL required");
        }
        if (!req.body.name) {
            res.status(400).send("Name required");
        }
        if (!req.body.preparation) {
            res.status(400).send("Preparation steps required");
        }
        try {
            const postResult = await db.collection("cocktail_collection")
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


            const cocktailId = postResult.insertedId;
            const ingredients = req.body.ingredients;

            const ingredientsResults = await db.collection("ingredient_usage")
                .insertOne({
                    "cocktailId": cocktailId,
                    "ingredients": ingredients
                })


            res.json({
                "post": postResult,
                "ingredients": ingredientsResults
            });
        } catch (e) {
            res.status(500);
            res.json({
                "error": "Database not available. Please try again later or contact the developer of this API."
            })
        }
    });


    // EDIT COCKTAIL POST [UPDATE]
    app.put("/cocktails/edit/:post_id", async function (req, res) {
        const postId = req.params.post_id;
        if (!req.body.userId) {
            res.status(400).send("UserID required");
        }
        if (!req.body.alcoholic) {
            res.status(400).send("Alcoholic type required");
        }
        if (!req.body.distinctions) {
            res.status(400).send("Distinctions required");
        }
        if (!req.body.glassType) {
            res.status(400).send("Glass type required");
        }
        if (!req.body.imageUrl) {
            res.status(400).send("Image URL required");
        }
        if (!req.body.name) {
            res.status(400).send("Name required");
        }
        if (!req.body.preparation) {
            res.status(400).send("Preparation steps required");
        }
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
    app.delete("/cocktails/delete/:post_id", async function (req, res) {
        const result = await db.collection("cocktail_collection")
            .deleteOne({
                "_id": new ObjectId(req.params.post_id)
            })

        const deleteIngredients = await db.collection("ingredient_usage")
            .deleteOne({
                "cocktailId": new ObjectId(req.params.post_id)
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
        if (!req.body.name) {
            res.status(400).send("Name required");
        }
        if (!req.body.dateOfBirth) {
            res.status(400).send("Date of Birth type required");
        }
        if (!req.body.email) {
            res.status(400).send("Email required");
        }
        if (!req.body.gender) {
            res.status(400).send("Gender required");
        }
        if (!req.body.country) {
            res.status(400).send("Country required");
        }
        if (!req.body.password) {
            res.status(400).send("Password required");
        }
        if (!req.body.username) {
            res.status(400).send("Username steps required");
        }
        try {
            const result = await db.collection("user_collection").insertOne({
                "name": req.body.name,
                "dateOfBirth": new Date(req.body.dateOfBirth),
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
        if (!req.body.name) {
            res.status(400).send("Name required");
        }
        if (!req.body.dateOfBirth) {
            res.status(400).send("Date of Birth type required");
        }
        if (!req.body.email) {
            res.status(400).send("Email required");
        }
        if (!req.body.gender) {
            res.status(400).send("Gender required");
        }
        if (!req.body.country) {
            res.status(400).send("Country required");
        }
        if (!req.body.password) {
            res.status(400).send("Password required");
        }
        if (!req.body.username) {
            res.status(400).send("Username steps required");
        }
        try {
            const updateUser = await db.collection("user_collection").updateOne({
                "_id": new ObjectId(userId)
            }, {
                "$set": {
                    "name": req.body.name,
                    "dateOfBirth": new Date(req.body.dateOfBirth),
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

    // GET REVIEWS FROM SELECTED POST [READ]
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

    // POST A NEW COMMENT ON A SELECTED POST [CREATE]
    // TO DO : FIND OUT HOW TO GET THE USER ID
    app.post("/cocktails/:post_id/new-review", async function (req, res) {
        try {
            const postId = new ObjectId(req.params.post_id);

            const result = await db.collection("reviews_collection").insertOne({
                "cocktailId": postId,
                "comments": req.body.comments,
                "rating": req.body.rating,
                "userId": req.body.userId
            })
            res.json({
                "result": result
            })
        } catch (e) {
            console.log(e)
        }
    })
}

reviews();




app.listen(process.env.PORT || 5500, () => {
    console.log("Server has started");
})



