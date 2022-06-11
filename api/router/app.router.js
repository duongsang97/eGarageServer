"use strict";
const express = require("express");
const router = express.Router();
const LoginController = require("../controllers/user/authenController");
const garageController = require("../controllers/garages/garageController");
const serviceCateController = require("../controllers/services/serviceCateController");
const serviceController = require("../controllers/services/serviceController");

router.post("/login", LoginController.doLogin);
router.use(LoginController.checkLogin);
router.route('/garage').get(garageController.list).post(garageController.create).put(garageController.update);
router.route('/servicecate').get(serviceCateController.list).post(serviceCateController.create).put(serviceCateController.update);
router.route('/service').get(serviceController.list).post(serviceController.create).put(serviceController.update);

router.get('*', function(req, res){ res.status(404).send(':) Not Found')});
module.exports = router;