"use strict";
const express = require("express");
const router = express.Router();
const LoginController = require("../controllers/user/authenController");
const garageController = require("../controllers/garages/garageController");

router.post("/login", LoginController.doLogin);
router.use(LoginController.checkLogin);
router.route('/garage').get(garageController.list).post(garageController.create).put(garageController.update);
router.get('*', function(req, res){ res.status(404).send(':) Not Found')});
module.exports = router;