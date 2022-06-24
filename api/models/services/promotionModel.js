"use strict";

const mongoose = require("mongoose");
const serverData = require("../../data/serverData");
const Promotion = mongoose.Schema(
  {
    recordStatus: { type: Number, enum: serverData.recordStatus, default: serverData.recordStatus[1] }, // trạng thais của bản ghi , 1 là hoạt động , 0 đã xóa
    
    hostId : { type: String}, // thuộc global  nào
    name: { type: String}, // Tên chương trình khuyến mãi
    fromDate: { type: Date}, //Từ ngày
    toDate: { type: Date}, //Tới ngày
    isAllGarage: { type: Number}, //1: áp dụng cho tất cả garage
    garages: { type: Object}, // DS garage áp dụng chương trình khuyến mãi
    promotionType: { type: Object}, //Loại khuyến mãi
    target: { type: Number}, //định mức khuyến mãi
    value: { type: Number}, //giá trị khuyến mãi
    products: { type: Object}, // Ds sp khuyến mãi - sp combo
    note: { type: String}, 
    createdBy: { type: mongoose.Types.ObjectId, ref: 'g_User',immutable: true, select: false}, // liên kêt với profile
    
    updatedBy: { type: mongoose.Types.ObjectId, ref: 'g_User'}, // liên kêt với profile
  },
  { versionKey: false, timestamps: true }
);
/** @memberOf account */
Promotion.statics.ObjectId = function (id) {
  return mongoose.Types.ObjectId(id);
};
const _promotion = mongoose.model("g_Promotion", Promotion);
module.exports = {
  Promotion: _promotion,
};