"use strict";
const mongoose = require("mongoose");
const serverData = require("../data/serverData");
const randomstring = require("randomstring");
const Profile = mongoose.Schema(
  {
    recordStatus: { type: Number, enum: serverData.recordStatus, default: serverData.recordStatus[1] }, // trạng thais của bản ghi , 1 là hoạt động , 0 đã xóa
    hostId: { type: mongoose.Types.ObjectId, ref: 'g_User' }, // thông tin chủ sở hữu

    code: { type: String, index: { unique: true } }, // mã NV
    firstName: { type: String },
    lastName: { type: String },
    gender: { type: Object, default: serverData.gender, default: serverData.gender[0] }, 

    //email:  { type: String,index: { unique: true }}, 
    //numberPhone:  { type: String}, 
    //address: { type: Object}, 
    //birthday: { type: String}, 

    //thịnh thêm

    workPlace: { type: Array }, //nơi làm việc [{code,name}]
    position: { type: Object }, // vị trí
    workType: { type: Object }, // hình thức làm việc
    workStatus: { type: Object }, //trạng thái làm việc
    idNo: { type: String }, //cmnd/cccd
    idPlace: { type: Object }, //nơi cấp
    idDate: { type: Date }, //ngày cấp
    startingDate: { type: Date }, //ngày bắt đầu làm việc
    endDate: { type: Date }, // ngày kết thúc làm việc
    avatar: { type: String }, //ảnh
    imageIDR: { type: String }, //ảnh CMND mặt trước
    imageIDL: { type: String }, //ảnh CMND mặt sau

    //Thông tin thêm
    phoneNumber: { type: String }, // SDT
    email: { type: String }, // Email
    birthday: { type: Date }, // ngày sinh
    address: { type: String }, // địa chị

    //Thông tin TK ngân hàng
    bankNo: { type: String }, // số tk ngân hàng
    bankName: { type: String }, // Tên ngân hàng
    bankUserName: { type: String }, // Tên chủ sở hữu
    note: { type: String }, // Ghi chú

  },
  { versionKey: false, timestamps: true }
);
/** @memberOf account */
Profile.statics.ObjectId = function (id) {
  return mongoose.Types.ObjectId(id);
};
Profile.statics.GenerateKeyCode = async function () {
  var d = new Date();
  var sDate = d.getFullYear() + "" + ("0" + (d.getMonth() + 1)).slice(-2) + "" + ("0" + d.getDate()).slice(-2);
  let countLoop = 0;
  let lengthKey = 5;
  let tempKey = "E" + sDate + randomstring.generate(lengthKey);
  let tempItem = await _profile.findOne({ "code": tempKey, "recordStatus": 1 });
  while (tempItem) {
    if (countLoop > 10) {
      lengthKey++;
      countLoop = 0;
    }
    tempKey = "E" + sDate + randomstring.generate(lengthKey);
    tempItem = await _profile.findOne({ "code": tempKey });
    countLoop++;
  }
  return tempKey;
};
Profile.statics.Validation = function (data) {
  var mess = '';
  if(!data.lastName || data.lastName === ''){
    if(mess !== '') mess += ', ';
    mess += 'Tên không được để trống';
  }
  if(!data.idNo || data.idNo === ''){
    if(mess !== '') mess += ', ';
    mess += 'CMND/CCCD không được để trống';
  }
  if(!data.phoneNumber || data.phoneNumber === ''){
    if(mess !== '') mess += ', ';
    mess += 'Số điện thoại không được để trống';
  }
  if(!data.email || data.email === ''){
    if(mess !== '') mess += ', ';
    mess += 'Mail không được để trống';
  }
  return mess;
};
const _profile = mongoose.model("g_Profile", Profile);
module.exports = {
  Profile: _profile,
};