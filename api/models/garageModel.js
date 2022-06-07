"use strict";
const mongoose = require("mongoose");
const serverData = require("../data/serverData");
const Garage = mongoose.Schema(
  {
    recordStatus: { type: Number, enum: serverData.recordStatus, default: serverData.recordStatus[1] }, // trạng thais của bản ghi , 1 là hoạt động , 0 đã xóa
    name: { type: String },
    address: { type: Object}, // địa chỉ
    numberPhone: { type: String },
    logo: { type: String },
    description: { type: String },
    images: { type: Array },
    createdBy: { type: mongoose.Types.ObjectId, ref: 'g_User',immutable: true, select: false}, // liên kêt với profile
    updatedBy: { type: mongoose.Types.ObjectId, ref: 'g_User'}, // liên kêt với profile
  },
  { versionKey: false, timestamps: true }
);
/** @memberOf account */
Garage.statics.ObjectId = function (id) {
  return mongoose.Types.ObjectId(id);
};
const _garage = mongoose.model("g_Garage", Garage);
module.exports = {
    Garage: _garage,
};