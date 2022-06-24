"use strict";
const mongoose = require("mongoose");
const serverData = require("../../../data/serverData");
const randomstring = require("randomstring");
const Inventory = mongoose.Schema(
  {
    recordStatus: { type: Number, enum: serverData.recordStatus, default: serverData.recordStatus[1] }, // trạng thais của bản ghi , 1 là hoạt động , 0 đã xóa
    product: {type: Object, default:{"code":"none","name":"none"}}, // thông tin sản phẩm
    amount: {type: Number, default:0}, // số lượng trong kho
    ofGarage: {type: Object, default:null}, // thuộc garage nào
    hostId: {type: mongoose.Types.ObjectId, ref: 'g_User'}, // thông tin chủ sở hữu
    note:  { type: String}, // ghi chú 
  },
  { versionKey: false, timestamps: true }
);
/** @memberOf account */
Inventory.statics.ObjectId = function (id) {
  return mongoose.Types.ObjectId(id);
};
Inventory.statics.GenerateKeyCode = async function (){
  let countLoop =0;
  let lengthKey =5;
  let tempKey = "inventory_"+randomstring.generate(lengthKey);
  let tempItem = await _inventory.findOne({"code":tempKey});
  while(tempItem){
    if(countLoop > 10){
      lengthKey++;
      countLoop=0;
    }
    tempKey = "inventory_"+randomstring.generate(lengthKey);
    tempItem = await _inventory.findOne({"code":tempKey});
    countLoop++;
  }
  return tempKey;
};
const _inventory = mongoose.model("g_ProductCate", Inventory);
module.exports = {
    Inventory: _inventory,
};