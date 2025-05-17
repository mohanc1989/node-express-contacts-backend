const express = require("express");
const { userRegister, userLogin, currentUser } = require("../controller/userController");
const validateToken = require("../middleware/validateTokenHandler");
const router = express.Router();

router.post("/register", userRegister);

router.post("/login", userLogin);

router.get("/current", validateToken, currentUser);

module.exports = router;