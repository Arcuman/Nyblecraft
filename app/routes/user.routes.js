const router = require("express").Router();
const users = require("../controllers/user.controller.js");

router.get("/", users.findAll);

router.get("/image/:id", users.findImage);

router.post("/", users.create);

router.get("/:id", users.findOne);

router.put("/createPDF", users.createPDF);

module.exports = router