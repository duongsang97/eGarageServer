"use strict";
const mongoose = require("mongoose");
const serverData = require("../../../data/serverData");
const randomstring = require("randomstring");
const Color = mongoose.Schema(
  {
    recordStatus: { type: Number, enum: serverData.recordStatus, default: serverData.recordStatus[1] }, // trạng thais của bản ghi , 1 là hoạt động , 0 đã xóa
    code: { type: String, index: { unique: true }}, // mã 
    name: { type: String}, // tên màu
    codeColor: { type: String,default:"#FFFFFF"}, // màu
    hostId: {type: mongoose.Types.ObjectId, ref: 'g_User'}, // thông tin chủ sở hữu
    createdBy: {type: mongoose.Types.ObjectId, ref: 'g_User'}, // thông tin nguòi tạo
    updatedBy: {type: mongoose.Types.ObjectId, ref: 'g_User'}, // thông tin nguời cập nhật cuối
    note:  { type: String}, // ghi chú 
  },
  { versionKey: false, timestamps: true }
);
/** @memberOf account */
Color.statics.ObjectId = function (id) {
  return mongoose.Types.ObjectId(id);
};
Color.statics.GenerateKeyCode = async function (){
  let countLoop =0;
  let lengthKey =5;
  let tempKey = "color_"+randomstring.generate(lengthKey);
  let tempItem = await _color.findOne({"code":tempKey});
  while(tempItem){
    if(countLoop > 10){
      lengthKey++;
      countLoop=0;
    }
    tempKey = "color_"+randomstring.generate(lengthKey);
    tempItem = await _color.findOne({"code":tempKey});
    countLoop++;
  }
  return tempKey;
};
const _color = mongoose.model("g_Color", Color);
module.exports = {
    Color: _color,
};