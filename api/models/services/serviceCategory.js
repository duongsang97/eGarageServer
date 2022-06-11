"use strict";
const mongoose = require("mongoose");
const serverData = require("../../data/serverData");
const ServiceCate = mongoose.Schema(
  {
    recordStatus: { type: Number, enum: serverData.recordStatus, default: serverData.recordStatus[1] }, // trạng thais của bản ghi , 1 là hoạt động , 0 đã xóa
    code: { type: String, index: { unique: true }}, // mã 
    name: { type: String}, // tên service
    ofGarage: {type: Object,default:{}}, // thuộc garage nào ---> nếu không có là global 
    hostId: {type: mongoose.Types.ObjectId, ref: 'g_User'}, // thông tin chủ sở hữu
    createdBy: {type: mongoose.Types.ObjectId, ref: 'g_User'}, // thông tin nguòi tạo
    updatedBy: {type: mongoose.Types.ObjectId, ref: 'g_User'}, // thông tin nguời cập nhật cuối
    note:  { type: String}, // ghi chú 
  },
  { versionKey: false, timestamps: true }
);
/** @memberOf account */
ServiceCate.statics.ObjectId = function (id) {
  return mongoose.Types.ObjectId(id);
};
const _serviceCate = mongoose.model("g_ServiceCate", ServiceCate);
module.exports = {
    ServiceCate: _serviceCate,
};