"use strict";

const mongoose = require("mongoose");
const serverData = require("../../data/serverData");
const randomstring = require("randomstring");
const Position = mongoose.Schema(
  {
    recordStatus: { type: Number, enum: serverData.recordStatus, default: serverData.recordStatus[1] }, // trạng thais của bản ghi , 1 là hoạt động , 0 đã xóa
    
    hostId: {type: mongoose.Types.ObjectId, ref: 'g_User'}, // thông tin chủ sở hữu
    code: { type: String,index: { unique: true }}, // mã 
    name: { type: String}, // Tên chương trình khuyến mãi
    isAllPermission: { type: Number}, //1: tất cả quyền
    permissions: { type: Object}, // DS quyền menu
    note: { type: String}, 
    createdBy: { type: mongoose.Types.ObjectId, ref: 'g_User',immutable: true, select: false}, // liên kêt với profile
    
    updatedBy: { type: mongoose.Types.ObjectId, ref: 'g_User'}, // liên kêt với profile
  },
  { versionKey: false, timestamps: true }
);
/** @memberOf account */
Position.statics.ObjectId = function (id) {
  return mongoose.Types.ObjectId(id);
};
Position.statics.GenerateKeyCode = async function (){
    let countLoop =0;
    let lengthKey =5;
    let tempKey = "Pos_"+randomstring.generate(lengthKey);
    let tempItem = await _position.findOne({"code":tempKey, "recordStatus": 1});
    while(tempItem){
      if(countLoop > 10){
        lengthKey++;
        countLoop=0;
      }
      tempKey = "Pos_"+randomstring.generate(lengthKey);
      tempItem = await _position.findOne({"code":tempKey});
      countLoop++;
    }
    return tempKey;
  };
const _position = mongoose.model("g_Position", Position);
module.exports = {
  Position: _position,
};