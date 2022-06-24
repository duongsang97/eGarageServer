"use strict";
const express = require("express");
const router = express.Router();
const LoginController = require("../controllers/user/authenController");
const garageController = require("../controllers/garages/garageController");
const groupCustomerController = require("../controllers/crm/groupCustomerController");
const customerInfoController = require("../controllers/crm/customerInfoController");
const promotionController = require("../controllers/services/promotionController");
const serviceCateController = require("../controllers/services/serviceCateController");
const serviceController = require("../controllers/services/serviceController");

router.post("/login", LoginController.doLogin);
router.use(LoginController.checkLogin);
router.route('/garage').get(garageController.list).post(garageController.create).put(garageController.update);

//crm
router.route('/groupcustomer').get(groupCustomerController.list).post(groupCustomerController.create)
.put(groupCustomerController.update).delete(groupCustomerController.delete);
router.route('/groupcustomer/exportexcel').get(groupCustomerController.exportExcel);
router.route('/groupcustomer/exporttemplateexcel').get(groupCustomerController.exportTemplateExcel);
router.route('/groupcustomer/importexcel').post(groupCustomerController.importExcel);
router.route('/groupcustomer/getone').get(groupCustomerController.getOne);

router.route('/customerinfo').get(customerInfoController.list).post(customerInfoController.create)
.put(customerInfoController.update).delete(customerInfoController.delete);
router.route('/customerinfo/exportexcel').get(customerInfoController.exportExcel);
router.route('/customerinfo/exporttemplateexcel').get(customerInfoController.exportTemplateExcel);
router.route('/customerinfo/getone').get(customerInfoController.getOne);

router.route('/promotion').get(promotionController.list).post(promotionController.create)
.put(promotionController.update).delete(promotionController.delete);
router.route('/promotion/getone').get(promotionController.getOne);
router.route('/promotion/getpromotiontype').get(promotionController.getPromotionType);
router.route('/promotion/getvaluetype').get(promotionController.getValueType);

router.route('/servicecate').get(serviceCateController.list).post(serviceCateController.create).put(serviceCateController.update);
router.route('/service').get(serviceController.list).post(serviceController.create).put(serviceController.update);

router.get('*', function(req, res){ res.status(404).send(':) Not Found')});
module.exports = router;