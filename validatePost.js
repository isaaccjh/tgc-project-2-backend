const { Validator } = require("jsonschema");

const cocktailSchema = {
  "type": "object",
  "properties": {
    "userId": {
      "type": "object",
      "properties": {
        "$oid": {
          "type": "string"
        }
      }
    },
    "alcoholic": {
      "type": "string"
    },
    "distinctions": {
      "type": "array",
      "items": {
        "type": "string"
      }
    },
    "glassType": {
      "type": "string"
    },
    "imageUrl": {
      "type": "string",
      "format": "uri"
    },
    "likes": {
      "type": "integer",
      "minimum": 0
    },
    "name": {
      "type": "string"
    },
    "preparation": {
      "type": "string"
    },
    "saved": {
      "type": "integer",
      "minimum": 0
    }
  },
  "required": [
    "userId",
    "alcoholic",
    "distinctions",
    "glassType",
    "imageUrl",
    "likes",
    "name",
    "preparation",
    "saved"
  ]
};

function validateCocktail(req, res, next) {
  const validator = new Validator();
  const validationResult = validator.validate(req.body, cocktailSchema);

  if (validationResult.valid) {
    next();
  } else {
    const errors = validationResult.errors.map((error) => error.stack);
    res.status(400).json({ errors });
  }
}

module.exports = validateCocktail;