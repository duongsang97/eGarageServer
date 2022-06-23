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
const productController = require("../controllers/storeManage/products/productController");
const supplierController = require("../controllers/storeManage/suppliers/supplierController");
const appDataeController = require("../controllers/app/appDataController");
const unitsController = require("../controllers/storeManage/units/unitsController");
const storesController = require("../controllers/storeManage/stores/storesController");
router.post("/login", LoginController.doLogin);
router.route('/appdata').get(appDataeController.list);
router.use(LoginController.checkLogin);
router.route('/garage').get(garageController.list).post(garageController.create).put(garageController.update);
router.route('/garage/getOne').get(garageController.getOne);

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
router.route('/servicecate/getOne').get(serviceCateController.getOne);

router.route('/service').get(serviceController.list).post(serviceController.create).put(serviceController.update);
router.route('/service/getOne').get(serviceController.getOne);
// quản lý kho
router.route('/productcate').get(productCateController.list).post(productCateController.create).put(productCateController.update);
router.route('/productcate/getOne').get(productCateController.getOne);

router.route('/product').get(productController.list).post(productController.create).put(productController.update);
router.route('/product/getOne').get(productController.getOne);

router.route('/suppliers').get(supplierController.list).post(supplierController.create).put(supplierController.update);
router.route('/suppliers/getOne').get(supplierController.getOne);

router.route('/units').get(unitsController.list).post(unitsController.create).put(unitsController.update); // đơn vị tính
router.route('/units/getOne').get(unitsController.getOne);

router.route('/stores').get(storesController.list).post(storesController.create).put(storesController.update); // thông tin kho
router.route('/stores/getOne').get(storesController.getOne);


// trả về 404 nếu không có trong router
router.get('*', function(req, res){ res.status(404).send(':) Not Found')});
module.exports = router;