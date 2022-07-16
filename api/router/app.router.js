"use strict";
const express = require("express");
const AppData = require("../data/serverData");
const multer = require('multer');
const router = express.Router();
const LoginController = require("../controllers/user/authenController");
const garageController = require("../controllers/garages/garageController");
const groupCustomerController = require("../controllers/crm/groupCustomerController");
const customerInfoController = require("../controllers/crm/customerInfoController");
const promotionController = require("../controllers/promotion/promotionController");
const serviceCateController = require("../controllers/services/serviceCateController");
const serviceController = require("../controllers/services/serviceController");
const productCateController = require("../controllers/storeManage/productCate/productCateController");
const productController = require("../controllers/storeManage/products/productController");
const supplierController = require("../controllers/storeManage/suppliers/supplierController");
const appDataeController = require("../controllers/app/appDataController");
const unitsController = require("../controllers/storeManage/units/unitsController");
const storesController = require("../controllers/storeManage/stores/storesController");

//profile
const employeeInfoController = require("../controllers/attendance/employeeInfoController");
const positionController = require("../controllers/attendance/positionController");

//payment
const bankAccountController = require("../controllers/payment/bankAccountController");
const payslipController = require("../controllers/payment/payslipController");
const receiptsController = require("../controllers/payment/receiptsController");


//common
const commonController = require("../controllers/commonController");

const dateFormat = require('date-format');
const fs = require('fs');
//cấu hình lưu trữ file khi upload xong
const storage = multer.diskStorage({
    
    destination: function (req, file, cb) {
        const folderNowDate = dateFormat('yyyyMMdd', new Date());
        let fullFolder = AppData.pathFolderUpload+"/"+folderNowDate;
      //files khi upload xong sẽ nằm trong thư mục "uploads" này - các bạn có thể tự định nghĩa thư mục này
      if (!fs.existsSync(fullFolder)){
        fs.mkdirSync(fullFolder);
        }
      cb(null, fullFolder) 
    },
    filename: function (req, file, cb) {
      
      // tạo tên file = thời gian hiện tại nối với số ngẫu nhiên => tên file chắc chắn không bị trùng
      const filename = Date.now() + '-' + Math.round(Math.random() * 1E9) 
      cb(null, filename + '-' + file.originalname )
    }
  }
);
//Khởi tạo middleware với cấu hình trên, lưu trên local của server khi dùng multer
const upload = multer({ storage: storage })

router.post("/login", LoginController.doLogin);
router.route('/appdata').get(appDataeController.list);
router.use(LoginController.checkLogin);


router.route('/garage').get(garageController.list)
    .post(upload.fields([{name: 'logo', maxCount: 1},{name: 'files', maxCount: 10}]),garageController.create)
    .put(upload.fields([{name: 'logo', maxCount: 1},{name: 'files', maxCount: 10}]),garageController.update);

router.route('/garage/getOne').get(garageController.getOne);

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
router.route('/customerinfo/getonebyphonenumber').get(customerInfoController.getOneByPhoneNumber);

router.route('/promotion').get(promotionController.list).post(promotionController.create)
.put(promotionController.update).delete(promotionController.delete);
router.route('/promotion/getone').get(promotionController.getOne);
router.route('/promotion/getpromotiontype').get(promotionController.getPromotionType);
router.route('/promotion/getvaluetype').get(promotionController.getValueType);

router.route('/servicecate').get(serviceCateController.list).post(serviceCateController.create).put(serviceCateController.update);
router.route('/service').get(serviceController.list).post(serviceController.create).put(serviceController.update);

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

//chấm công
router.route('/emp').get(employeeInfoController.list)
.post(upload.fields([{name: 'avatar', maxCount: 1},{name: 'imageIDR', maxCount: 1},{name: 'imageIDL', maxCount: 1}]),employeeInfoController.create)
.put(upload.fields([{name: 'avatar', maxCount: 1},{name: 'imageIDR', maxCount: 1},{name: 'imageIDL', maxCount: 1}]),employeeInfoController.update)
.delete(employeeInfoController.delete);
router.route('/emp/getone').get(employeeInfoController.getOne);

router.route('/pos').get(positionController.list).post(positionController.create)
.put(positionController.update).delete(positionController.delete);
router.route('/pos/getone').get(positionController.getOne);

router.route('/bankacc').get(bankAccountController.list).post(bankAccountController.create)
.put(bankAccountController.update).delete(bankAccountController.delete);
router.route('/bankacc/getone').get(bankAccountController.getOne);

router.route('/payslip').get(payslipController.list).post(payslipController.create)
.put(payslipController.update).delete(payslipController.delete);
router.route('/payslip/getone').get(payslipController.getOne);

router.route('/receipts').get(receiptsController.list).post(receiptsController.create)
.put(receiptsController.update).delete(receiptsController.delete);
router.route('/receipts/getone').get(receiptsController.getOne);


router.route('/common/getworktype').get(commonController.getWorkType);
router.route('/common/getworkstatus').get(commonController.getWorkStatus);
router.route('/common/getpaytype').get(commonController.getPayType);
router.route('/common/getreceiptsreason').get(commonController.getReceiptsReason);
router.route('/common/getpayslipreason').get(commonController.getPayslipReason);

// trả về 404 nếu không có trong router
router.get('*', function(req, res){ res.status(404).send(':) Not Found')});
module.exports = router;