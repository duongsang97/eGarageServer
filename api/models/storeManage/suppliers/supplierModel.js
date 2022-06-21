"use strict";
const mongoose = require("mongoose");
const serverData = require("../../../data/serverData");
const randomstring = require("randomstring");
const Supplier = mongoose.Schema(
  {
    recordStatus: { type: Number, enum: serverData.recordStatus, default: serverData.recordStatus[1] }, // trạng thais của bản ghi , 1 là hoạt động , 0 đã xóa
    code: { type: String,index: { unique: true }}, // mã 
    supplierSymbol:{type: String,},
    name: { type: String}, // tên service
    numberPhone: { type: String,index: { unique: true }}, // số điện thoại
    address: { type: String}, // địa chỉ
    bankInfo: { type: Array,default:[]}, // ngân hàng [{bankName:"Tên ngân hàng","accountNumber": 12312312,createdAt: DateTime}]
    hostId: {type: mongoose.Types.ObjectId, ref: 'g_User'}, // thông tin chủ sở hữu
    createdBy: {type: mongoose.Types.ObjectId, ref: 'g_User'}, // thông tin nguòi tạo
    updatedBy: {type: mongoose.Types.ObjectId, ref: 'g_User'}, // thông tin nguời cập nhật cuối
    note:  { type: String}, // ghi chú 
  },
  { versionKey: false, timestamps: true }
);
/** @memberOf account */
Supplier.statics.ObjectId = function (id) {
  return mongoose.Types.ObjectId(id);
};
Supplier.statics.GenerateKeyCode = async function (){
  let countLoop =0;
  let lengthKey =5;
  let tempKey = "supplier_"+randomstring.generate(lengthKey);
  let tempItem = await _supplier.findOne({"code":tempKey});
  while(tempItem){
    if(countLoop > 10){
      lengthKey++;
      countLoop=0;
    }
    tempKey = "supplier_"+randomstring.generate(lengthKey);
    tempItem = await _supplier.findOne({"code":tempKey});
    countLoop++;
  }
  return tempKey;
};

const _supplier = mongoose.model("g_Supplier", Supplier);


module.exports = {
    Supplier: _supplier,

};