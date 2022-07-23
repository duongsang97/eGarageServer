"use strict";

const mongoose = require("mongoose");
const serverData = require("../../data/serverData");
const randomstring = require("randomstring");
const GroupCustomer = mongoose.Schema(
  {
    recordStatus: { type: Number, enum: serverData.recordStatus, default: serverData.recordStatus[1] }, // trạng thais của bản ghi , 1 là hoạt động , 0 đã xóa
    
    code: { type: String,index: { unique: true }}, // mã  
    name: { type: String},
    hostId: {type: mongoose.Types.ObjectId, ref: 'g_User'}, // thông tin chủ sở hữu
    target: { type: Number, default: 0}, //chỉ tiêu điểm
    discount: { type: Number, default: 0}, // chiết khấu %
    note: { type: String}, 
    createdBy: { type: mongoose.Types.ObjectId, ref: 'g_User',immutable: true, select: false}, // liên kêt với profile
    
    updatedBy: { type: mongoose.Types.ObjectId, ref: 'g_User'}, // liên kêt với profile
  },
  { versionKey: false, timestamps: true }
);
/** @memberOf account */
GroupCustomer.statics.ObjectId = function (id) {
  return mongoose.Types.ObjectId(id);
};
GroupCustomer.statics.GenerateKeyCode = async function (){
    let countLoop =0;
    let lengthKey =5;
    let tempKey = "GC_"+randomstring.generate(lengthKey);
    let tempItem = await _groupCustomer.findOne({"code":tempKey, "recordStatus": 1});
    while(tempItem){
      if(countLoop > 10){
        lengthKey++;
        countLoop=0;
      }
      tempKey = "GC_"+randomstring.generate(lengthKey);
      tempItem = await _groupCustomer.findOne({"code":tempKey});
      countLoop++;
    }
    return tempKey;
  };
const _groupCustomer = mongoose.model("g_GroupCustomer", GroupCustomer);
module.exports = {
  GroupCustomer: _groupCustomer,
};