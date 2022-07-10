"use strict";

const mongoose = require("mongoose");
const serverData = require("../../data/serverData");
const randomstring = require("randomstring");
const EmployeeInfo = mongoose.Schema(
  {
    recordStatus: { type: Number, enum: serverData.recordStatus, default: serverData.recordStatus[1] }, // trạng thais của bản ghi , 1 là hoạt động , 0 đã xóa
    
    hostId: {type: mongoose.Types.ObjectId, ref: 'g_User'}, // thông tin chủ sở hữu
    code: { type: String,index: { unique: true }}, // mã 
    name: { type: String}, // Tên chương trình khuyến mãi
    workPlace: { type: Object}, //nơi làm việc
    positon: { type: Object}, // vị trí
    workType: { type: Object}, // hình thức làm việc
    workStatus: { type: Object}, //trạng thái làm việc
    idNo: { type: String}, //cmnd/cccd
    idPlace: { type: Object}, //nơi cấp
    idDate: { type: Date}, //ngày cấp
    startingDate: { type: Date}, //ngày bắt đầu làm việc
    endDate: { type: Date}, // ngày kết thúc làm việc

    avatar: { type: String}, //ảnh
    fileId: { type: Object}, //ảnh cmnd/CCCD

    //Thông tin thêm
    phoneNumber: { type: String}, // SDT
    email: { type: String}, // Email
    birthday: { type: Date}, // ngày sinh
    address: { type: String}, // địa chị
    gender: { type: Object}, //giới tính

    //Thông tin TK ngân hàng
    bankNo: { type: String}, // số tk ngân hàng
    bankName: { type: String}, // Tên ngân hàng
    bankUserName: { type: String}, // Tên chủ sở hữu

    note: { type: String}, 
    createdBy: { type: mongoose.Types.ObjectId, ref: 'g_User',immutable: true, select: false}, // liên kêt với profile
    
    updatedBy: { type: mongoose.Types.ObjectId, ref: 'g_User'}, // liên kêt với profile
  },
  { versionKey: false, timestamps: true }
);
/** @memberOf account */
EmployeeInfo.statics.ObjectId = function (id) {
  return mongoose.Types.ObjectId(id);
};
EmployeeInfo.statics.GenerateKeyCode = async function (){
    let countLoop =0;
    let lengthKey =5;
    let tempKey = "E_"+randomstring.generate(lengthKey);
    let tempItem = await _employee.findOne({"code":tempKey, "recordStatus": 1});
    while(tempItem){
      if(countLoop > 10){
        lengthKey++;
        countLoop=0;
      }
      tempKey = "E_"+randomstring.generate(lengthKey);
      tempItem = await _employee.findOne({"code":tempKey});
      countLoop++;
    }
    return tempKey;
  };
const _employee = mongoose.model("g_EmployeeInfo", EmployeeInfo);
module.exports = {
  EmployeeInfo: _employee,
};