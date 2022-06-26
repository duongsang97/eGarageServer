"use strict";
const mongoose = require("mongoose");
const serverData = require("../../../data/serverData");
const randomstring = require("randomstring");
const InventoryHistory = mongoose.Schema(
  {
    recordStatus: { type: Number, enum: serverData.recordStatus, default: serverData.recordStatus[1] }, // trạng thais của bản ghi , 1 là hoạt động , 0 đã xóa
    changeInfo: {type: Array, default:{"code":"none","name":"none","amount":0}}, // thông tin sản phẩm thay đổi
    ofGarage: {type: Object, default:null}, // thuộc garage nào
    hostId: {type: mongoose.Types.ObjectId, ref: 'g_User'}, // thông tin chủ sở hữu
  },
  { versionKey: false, timestamps: true }
);
/** @memberOf account */
InventoryHistory.statics.ObjectId = function (id) {
  return mongoose.Types.ObjectId(id);
};
InventoryHistory.statics.GenerateKeyCode = async function (){
  let countLoop =0;
  let lengthKey =5;
  let tempKey = "inventoryHistory_"+randomstring.generate(lengthKey);
  let tempItem = await _inventoryHistory.findOne({"code":tempKey});
  while(tempItem){
    if(countLoop > 10){
      lengthKey++;
      countLoop=0;
    }
    tempKey = "InventoryHistory_"+randomstring.generate(lengthKey);
    tempItem = await _inventoryHistory.findOne({"code":tempKey});
    countLoop++;
  }
  return tempKey;
};
const _inventoryHistory = mongoose.model("g_inventoryHistory", InventoryHistory);
module.exports = {
    InventoryHistory: _inventoryHistory,
};