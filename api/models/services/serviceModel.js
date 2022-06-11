"use strict";
const mongoose = require("mongoose");
const serverData = require("../../data/serverData");
const Service = mongoose.Schema(
  {
    recordStatus: { type: Number, enum: serverData.recordStatus, default: serverData.recordStatus[1] }, // trạng thais của bản ghi , 1 là hoạt động , 0 đã xóa
    code: { type: String, index: { unique: true }}, // mã 
    name: { type: String}, // tên service
    serviceCate: {type: Object,default:{}}, // thuộc cate nào
    price:{type: Number}, // giá 
    insurance :{type: Object,default:{}}, // bảo hành {"value":1,"type":{"code":"typeDay","name":"Ngày"}}
    executionTime: {type: Number}, // thời gian thực hiện , tính theo phút
    ofGarage: {type: Object,default:{}}, // thuộc garage nào ---> nếu không có là global 
    hostId: {type: mongoose.Types.ObjectId, ref: 'g_User'}, // thông tin chủ sở hữu
    createdBy: {type: mongoose.Types.ObjectId, ref: 'g_User'}, // thông tin nguòi tạo
    updatedBy: {type: mongoose.Types.ObjectId, ref: 'g_User'}, // thông tin nguời cập nhật cuối
    note:  { type: String}, // ghi chú 
  },
  { versionKey: false, timestamps: true }
);
/** @memberOf account */
Service.statics.ObjectId = function (id) {
  return mongoose.Types.ObjectId(id);
};
const _service = mongoose.model("g_Service", Service);
module.exports = {
    Service: _service,
};