"use strict";
const mongoose = require("mongoose");
const serverData = require("../../data/serverData");
const randomstring = require("randomstring");
const Automaker = mongoose.Schema(
  {
    recordStatus: { type: Number, enum: serverData.recordStatus, default: serverData.recordStatus[1] }, // trạng thais của bản ghi , 1 là hoạt động , 0 đã xóa
    code: { type: String, index: { unique: true }}, // mã hãng xe
    name: { type: String}, // Tên hãng xe
    logo:{ type: String}, // Logo hãng xe
    hostId: {type: mongoose.Types.ObjectId, ref: 'g_User'}, // thông tin chủ sở hữu
    createdBy: {type: mongoose.Types.ObjectId, ref: 'g_User'}, // thông tin nguòi tạo
    updatedBy: {type: mongoose.Types.ObjectId, ref: 'g_User'}, // thông tin nguời cập nhật cuối
    note:  { type: String}, // ghi chú 
  },
  { versionKey: false, timestamps: true }
);
/** @memberOf account */
Automaker.statics.ObjectId = function (id) {
  return mongoose.Types.ObjectId(id);
};
Automaker.statics.GenerateKeyCode = async function (){
  let countLoop =0;
  let lengthKey =5;
  let tempKey = "automaker_"+randomstring.generate(lengthKey);
  let tempItem = await _automaker.findOne({"code":tempKey});
  while(tempItem){
    if(countLoop > 10){
      lengthKey++;
      countLoop=0;
    }
    tempKey = "automaker_"+randomstring.generate(lengthKey);
    tempItem = await _automaker.findOne({"code":tempKey});
    countLoop++;
  }
  return tempKey;
};
const _automaker = mongoose.model("g_AutoMarket", Automaker);
module.exports = {
    Automaker: _automaker,
};