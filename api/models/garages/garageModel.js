"use strict";
const mongoose = require("mongoose");
const serverData = require("../../data/serverData");
const randomstring = require("randomstring");
const Garage = mongoose.Schema(
  {
    recordStatus: { type: Number, enum: serverData.recordStatus, default: serverData.recordStatus[1] }, // trạng thais của bản ghi , 1 là hoạt động , 0 đã xóa
    code:{ type: String, index: { unique: true }}, // mã 
    name: { type: String },
    address: { type: Object}, // địa chỉ
    numberPhone: { type: String },
    logo: { type: String }, //logo
    description: { type: String },
    images: { type: Array }, // hình ảnh về garage
    hostId: {type: mongoose.Types.ObjectId, ref: 'g_User'}, // thông tin chủ sở hữu
    createdBy: {type: mongoose.Types.ObjectId, ref: 'g_User'}, // thông tin nguòi tạo
    updatedBy: {type: mongoose.Types.ObjectId, ref: 'g_User'}, // thông tin nguời cập nhật cuối
    note:  { type: String}, // ghi chú 
  },
  { versionKey: false, timestamps: true }
);
/** @memberOf account */
Garage.statics.ObjectId = function (id) {
  return mongoose.Types.ObjectId(id);
};
Garage.statics.GenerateKeyCode = async function (){
  let countLoop =0;
  let lengthKey =5;
  let tempKey = "garage_"+randomstring.generate(lengthKey);
  let tempItem = await _garage.findOne({"code":tempKey});
  while(tempItem){
    if(countLoop > 10){
      lengthKey++;
      countLoop=0;
    }
    tempKey = "garage_"+randomstring.generate(lengthKey);
    tempItem = await _garage.findOne({"code":tempKey});
    countLoop++;
  }
  return tempKey;
};
const _garage = mongoose.model("g_Garage", Garage);
module.exports = {
    Garage: _garage,
};