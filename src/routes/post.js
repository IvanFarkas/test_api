const express = require("express");
const { check, oneOf, validationResult, body } = require("express-validator");
// TODO: Integrate Ajv (Another JSON Schema Validator) - https://simonplend.com/how-to-handle-request-validation-in-your-express-api/
// const { Validator } = require("express-json-validator-middleware");
// const { validate } = new Validator();

const controller = require("../controllers/post");
const isAuth = require("../middleware/is-auth");

const router = express.Router();

router.post("/", isAuth, [body("title").trim().isLength({ min: 5 }), body("content").trim().isLength({ min: 5 })], controller.create);

router.get("/all", isAuth, controller.getAll);

router.get("/:id", isAuth, controller.get);

router.put("/:id", isAuth, [body("title").trim().isLength({ min: 5 }), body("content").trim().isLength({ min: 5 })], controller.update);

router.delete("/:id", isAuth, controller.delete);

module.exports = router;
