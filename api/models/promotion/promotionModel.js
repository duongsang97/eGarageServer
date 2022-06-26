"use strict";

const mongoose = require("mongoose");
const serverData = require("../../data/serverData");
const randomstring = require("randomstring");
const Promotion = mongoose.Schema(
  {
    recordStatus: { type: Number, enum: serverData.recordStatus, default: serverData.recordStatus[1] }, // trạng thais của bản ghi , 1 là hoạt động , 0 đã xóa
    
    hostId: {type: mongoose.Types.ObjectId, ref: 'g_User'}, // thông tin chủ sở hữu
    code: { type: String,index: { unique: true }}, // mã 
    name: { type: String}, // Tên chương trình khuyến mãi
    fromDate: { type: Date}, //Từ ngày
    toDate: { type: Date}, //Tới ngày
    isAllGarage: { type: Number}, //1: áp dụng cho tất cả garage
    garages: { type: Object}, // DS garage áp dụng chương trình khuyến mãi
    promotionType: { type: Object}, //Loại khuyến mãi
    target: { type: Number}, //định mức khuyến mãi
    value: { type: Number}, //giá trị khuyến mãi
    valueType: { type: Object}, //Loại giá trị
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
Promotion.statics.GenerateKeyCode = async function (){
    let countLoop =0;
    let lengthKey =5;
    let tempKey = "P_"+randomstring.generate(lengthKey);
    let tempItem = await _promotion.findOne({"code":tempKey, "recordStatus": 1});
    while(tempItem){
      if(countLoop > 10){
        lengthKey++;
        countLoop=0;
      }
      tempKey = "P_"+randomstring.generate(lengthKey);
      tempItem = await _promotion.findOne({"code":tempKey});
      countLoop++;
    }
    return tempKey;
  };
const _promotion = mongoose.model("g_Promotion", Promotion);
module.exports = {
  Promotion: _promotion,
};