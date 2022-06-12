"use strict";

const mongoose = require("mongoose");
const serverData = require("../../data/serverData");
const GroupCustomer = mongoose.Schema(
  {
    recordStatus: { type: Number, enum: serverData.recordStatus, default: serverData.recordStatus[1] }, // trạng thais của bản ghi , 1 là hoạt động , 0 đã xóa 
    name: { type: String},
    garage: { type: Object},
    target: { type: Number, default: 0}, //chỉ tiêu điểm
    discount: { type: Number, default: 0}, // chiết khấu
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
const _groupCustomer = mongoose.model("g_GroupCustomer", GroupCustomer);
module.exports = {
  GroupCustomer: _groupCustomer,
};