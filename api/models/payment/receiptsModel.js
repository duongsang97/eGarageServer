"use strict";

const mongoose = require("mongoose");
const serverData = require("../../data/serverData");
const randomstring = require("randomstring");
const Receipts = mongoose.Schema(
  {
    recordStatus: { type: Number, enum: serverData.recordStatus, default: serverData.recordStatus[1] }, // trạng thais của bản ghi , 1 là hoạt động , 0 đã xóa
    ofGarage: { type: Object }, // của garage nào
    code: { type: String, index: { unique: true } }, // mã  
    hostId: { type: mongoose.Types.ObjectId, ref: 'g_User' }, // thông tin chủ sở hữu
    phoneNumber: { type: String }, //SDT
    payerName: { type: String }, //Họ tên người nộp
    reason: { type: Object }, // Lý do 
    billCode: { type: String }, //Mã hóa đơn
    reasonOther: { type: String }, // Lý do khác
    amount: { type: Number }, //Số tiền
    sAmount: { type: String },  //Số tiền bằng chữ
    payType: { type: Object }, // hình thức thanh toán
    bankAccount: { type: Object }, // Tài khoản nhận
    note: { type: String },
    createdBy: { type: mongoose.Types.ObjectId, ref: 'g_User', immutable: true, select: false }, // liên kêt với profile

    updatedBy: { type: mongoose.Types.ObjectId, ref: 'g_User' }, // liên kêt với profile
  },
  { versionKey: false, timestamps: true }
);
/** @memberOf account */
Receipts.statics.ObjectId = function (id) {
  return mongoose.Types.ObjectId(id);
};
Receipts.statics.GenerateKeyCode = async function () {
  var d = new Date();
  var sDate = d.getFullYear() + "" + ("0" + (d.getMonth() + 1)).slice(-2) + "" + ("0" + d.getDate()).slice(-2);
  let countLoop = 0;
  let lengthKey = 5;
  let tempKey = sDate + "_" + randomstring.generate(lengthKey);
  let tempItem = await _receipts.findOne({ "code": tempKey, "recordStatus": 1 });
  while (tempItem) {
    if (countLoop > 10) {
      lengthKey++;
      countLoop = 0;
    }
    tempKey = sDate + "_" + randomstring.generate(lengthKey);
    tempItem = await _receipts.findOne({ "code": tempKey });
    countLoop++;
  }
  return tempKey;
};
const _receipts = mongoose.model("g_Receipts", Receipts);
module.exports = {
  Receipts: _receipts,
};