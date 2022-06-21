"use strict";
const express = require("express");
const router = express.Router();
const LoginController = require("../controllers/user/authenController");
const garageController = require("../controllers/garages/garageController");
const groupCustomerController = require("../controllers/crm/groupCustomerController");
const customerInfoController = require("../controllers/crm/customerInfoController");
const serviceCateController = require("../controllers/services/serviceCateController");
const serviceController = require("../controllers/services/serviceController");
const productCateController = require("../controllers/storeManage/productCate/productCateController");
const appDataeController = require("../controllers/app/appDataController");
router.post("/login", LoginController.doLogin);
router.route('/appdata').get(appDataeController.list);
router.use(LoginController.checkLogin);
router.route('/garage').get(garageController.list).post(garageController.create).put(garageController.update);

//crm
router.route('/groupcustomer').get(groupCustomerController.list).post(groupCustomerController.create)
.put(groupCustomerController.update).delete(groupCustomerController.delete);
router.route('/groupcustomer/exportexcel').get(groupCustomerController.exportExcel);
router.route('/groupcustomer/exporttemplateexcel').get(groupCustomerController.exportTemplateExcel);

router.route('/customerinfo').get(customerInfoController.list).post(customerInfoController.create)
.put(customerInfoController.update).delete(customerInfoController.delete);
router.route('/customerinfo/exportexcel').get(customerInfoController.exportExcel);
router.route('/customerinfo/exporttemplateexcel').get(customerInfoController.exportTemplateExcel);

// service api
router.route('/servicecate').get(serviceCateController.list).post(serviceCateController.create).put(serviceCateController.update);
router.route('/service').get(serviceController.list).post(serviceController.create).put(serviceController.update);

// quản lý kho
router.route('/productcate').get(productCateController.list).post(productCateController.create).put(productCateController.update);


// trả về 404 nếu không có trong router
router.get('*', function(req, res){ res.status(404).send(':) Not Found')});
module.exports = router;