"use strict";
const mongoose = require("mongoose");
const serverData = require("../../data/serverData");
const randomstring = require("randomstring");
const Vehicle = mongoose.Schema(
  {
    recordStatus: { type: Number, enum: serverData.recordStatus, default: serverData.recordStatus[1] }, // trạng thais của bản ghi , 1 là hoạt động , 0 đã xóa
    code: { type: String, index: { unique: true }}, // mã 
    carOwner:{type : Object,default:{"code":"none","name":"none"}}, // chủ xe {"code":"mã","name":"tên chủ xe"}
    licensePlates: { type: String, index: { unique: true }}, // biển số
    automaker:{type:Object,default:{"code":"none","name":"name"}}, // hãng xe
    carModel:{type:Object,default:{"code":"none","name":"name"}}, // dòng xe , đi theo hãng xe
    carColor:{type: Object,default:{ "code": "mã màu","name": "Tên màu","codeColor": "#FFFFF"}}, // màu xe
    odo: { type: Number,default: 0}, // số công tơ met
    hostId: {type: mongoose.Types.ObjectId, ref: 'g_User'}, // thông tin chủ sở hữu
    createdBy: {type: mongoose.Types.ObjectId, ref: 'g_User'}, // thông tin nguòi tạo
    updatedBy: {type: mongoose.Types.ObjectId, ref: 'g_User'}, // thông tin nguời cập nhật cuối
    note:  { type: String}, // ghi chú 
  },
  { versionKey: false, timestamps: true }
);
/** @memberOf account */
Vehicle.statics.ObjectId = function (id) {
  return mongoose.Types.ObjectId(id);
};
Vehicle.statics.GenerateKeyCode = async function (){
  let countLoop =0;
  let lengthKey =5;
  let tempKey = "vehicle_"+randomstring.generate(lengthKey);
  let tempItem = await _vehicle.findOne({"code":tempKey});
  while(tempItem){
    if(countLoop > 10){
      lengthKey++;
      countLoop=0;
    }
    tempKey = "vehicle_"+randomstring.generate(lengthKey);
    tempItem = await _vehicle.findOne({"code":tempKey});
    countLoop++;
  }
  return tempKey;
};
const _vehicle = mongoose.model("g_Vehicle", Vehicle);
module.exports = {
    Vehicle: _vehicle,
};