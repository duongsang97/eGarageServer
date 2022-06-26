"use strict";
const mongoose = require("mongoose");
const serverData = require("../../../data/serverData");
const randomstring = require("randomstring");
const Product = mongoose.Schema(
  {
    recordStatus: { type: Number, enum: serverData.recordStatus, default: serverData.recordStatus[1] }, // trạng thais của bản ghi , 1 là hoạt động , 0 đã xóa
    code: { type: String, index: { unique: true }}, // mã 
    name: { type: String}, // tên 
    productCate: {type: Object, default:null}, // thuộc loại nào
    ofGarage: {type: Object, default:null}, // thuộc garage nào ---> nếu không có là global 
    manufacturer: {type: Object,default:{"code":"none","name":"none"}}, // thuộc nhà sản xuất nào
    model: {type: String}, // model sản phẩm
    warrantyTime: {type: Object,default:{}}, // thời gian bảo hành {"value":1,"type":{"code":"typeDay","name":"Ngày"}}
    warrantyNote: {type: String}, // ghi chú bảo hành
    price: {type: Number,default:0}, // giá bán
    warrantyLength: {type: Object,default:{}}, // km bảo hành {"value":1,"type":{"code":"typeKm","name":"Km"}}
    images:{type: Array}, // hình ảnh ["link1","link_2"]
    historicalCost: {type:Number,default:0}, // giá gốc
    hostId: {type: mongoose.Types.ObjectId, ref: 'g_User'}, // thông tin chủ sở hữu
    createdBy: {type: mongoose.Types.ObjectId, ref: 'g_User'}, // thông tin nguòi tạo
    updatedBy: {type: mongoose.Types.ObjectId, ref: 'g_User'}, // thông tin nguời cập nhật cuối
    note:  { type: String}, // ghi chú 
  },
  { versionKey: false, timestamps: true }
);
/** @memberOf account */
Product.statics.ObjectId = function (id) {
  return mongoose.Types.ObjectId(id);
};
Product.statics.GenerateKeyCode = async function (){
  let countLoop =0;
  let lengthKey =5;
  let tempKey = "product_"+randomstring.generate(lengthKey);
  let tempItem = await _product.findOne({"code":tempKey});
  while(tempItem){
    if(countLoop > 10){
      lengthKey++;
      countLoop=0;
    }
    tempKey = "product_"+randomstring.generate(lengthKey);
    tempItem = await _product.findOne({"code":tempKey});
    countLoop++;
  }
  return tempKey;
};
const _product = mongoose.model("g_Product", Product);
module.exports = {
    Product: _product,
};