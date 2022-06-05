"use strict";
const express = require("express");
const router = express.Router();
const LoginController = require("../controllers/user/authenController");
// const houseController = require("../controller/house/houseController");

router.post("/login", LoginController.doLogin);
// router.use(LoginController.checkLogin);
// router.post("/chooseHouse", LoginController.chooseHouse);

module.exports = router;