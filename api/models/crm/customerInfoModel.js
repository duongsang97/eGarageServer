"use strict";

const mongoose = require("mongoose");
const serverData = require("../../data/serverData");
const CustomerInfo = mongoose.Schema(
  {
    recordStatus: { type: Number, enum: serverData.recordStatus, default: serverData.recordStatus[1] }, // trạng thais của bản ghi , 1 là hoạt động , 0 đã xóa
    
    name: { type: String}, // Tên khách hàng
    phoneNumber: { type: String}, //SDT
    email: { type: String}, //email
    global : { type: Object}, // thuộc global  nào
    group: { type: Object}, // nhóm KH
    birthday: { type: Date}, //ngày sinh
    address: { type: String}, // địa chỉ
    idNo: { type: String}, // cmnd/cccd
    idPlace: { type: String}, // nơi cấp cmnd
    idBank: { type: String}, // STK ngân hàng
    bankName: { type: String}, // tên ngân hàng
    note: { type: String}, 
    createdBy: { type: mongoose.Types.ObjectId, ref: 'g_User',immutable: true, select: false}, // liên kêt với profile
    
    updatedBy: { type: mongoose.Types.ObjectId, ref: 'g_User'}, // liên kêt với profile
  },
  { versionKey: false, timestamps: true }
);
/** @memberOf account */
CustomerInfo.statics.ObjectId = function (id) {
  return mongoose.Types.ObjectId(id);
};
const _customerInfo = mongoose.model("g_CustomerInfo", CustomerInfo);
module.exports = {
  CustomerInfo: _customerInfo,
};