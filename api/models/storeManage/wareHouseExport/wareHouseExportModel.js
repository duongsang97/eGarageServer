"use strict";
const mongoose = require("mongoose");
const serverData = require("../../../data/serverData");
const randomstring = require("randomstring");
const WareHouseExport = mongoose.Schema(
  {
    recordStatus: { type: Number, enum: serverData.recordStatus, default: serverData.recordStatus[1] }, // trạng thais của bản ghi , 1 là hoạt động , 0 đã xóa
    code: { type: String, index: { unique: true }}, // mã 
    receivingObject: { type: Object,default:{"name":"note","address":"none"}}, // thông tin đối tương nhận 
    reason:  {type: String}, // lý do xuất kho
    ofGarage: {type: Object, default:null}, // thông tin xuất từ garage nào
    exportTo:  {type: Object, default:null}, // xuất tới kho nào --> nếu null xuất kho ra ngoài ngược lại xuất kho nội bộ
    totalMoneyNumber: {type: Number}, // tổng tiền bằng số
    totalMoneyString: {type: String}, // tổng tiền băng chữ
    voucherNumber :{type: String}, // số chứng tư
    exportDate: {type: Date,default: Date.now},
    exportDetail: {type:Array,default:[]},// {"OrdinalNumber":1,"product":{"code":"mã sp","name":"tên sản phẩm"},unit:{"code":"type_1","name":"kg"}}
    hostId: {type: mongoose.Types.ObjectId, ref: 'g_User'}, // thông tin chủ sở hữu
    createdBy: {type: mongoose.Types.ObjectId, ref: 'g_User'}, // thông tin nguòi tạo
    updatedBy: {type: mongoose.Types.ObjectId, ref: 'g_User'}, // thông tin nguời cập nhật cuối
    note:  { type: String}, // ghi chú 
  },
  { versionKey: false, timestamps: true }
);
/** @memberOf account */
WareHouseExport.statics.ObjectId = function (id) {
  return mongoose.Types.ObjectId(id);
};
WareHouseExport.statics.GenerateKeyCode = async function (){
  let countLoop =0;
  let lengthKey =5;
  let tempKey = "wareHouseExport_"+randomstring.generate(lengthKey);
  let tempItem = await _wareHouseExport.findOne({"code":tempKey});
  while(tempItem){
    if(countLoop > 10){
      lengthKey++;
      countLoop=0;
    }
    tempKey = "wareHouseExport_"+randomstring.generate(lengthKey);
    tempItem = await _wareHouseExport.findOne({"code":tempKey});
    countLoop++;
  }
  return tempKey;
};
const _wareHouseExport = mongoose.model("g_wareHouseExport", WareHouseExport);
module.exports = {
    WareHouseExport: _wareHouseExport,
};

// {
//   "OrdinalNumber": 1,
//   "product": {
//     "code": "mã sp",
//     "name": "tên sản phẩm"
//   },
//   "unit": {
//     "code": "type_1",
//     "name": "kg"
//   },
//   "reqeustActual": 3,
//   "actual": 2,
//   "unitPrice": 12000,
//   "amount": 24000
//}