"use strict";
const mongoose = require("mongoose");
const serverData = require("../../../data/serverData");
const randomstring = require("randomstring");
const WareHouseReceipt = mongoose.Schema(
  {
    recordStatus: { type: Number, enum: serverData.recordStatus, default: serverData.recordStatus[1] }, // trạng thais của bản ghi , 1 là hoạt động , 0 đã xóa
    code: { type: String, index: { unique: true }}, // mã 
    receiptStatus :{type: Number}, // -1 hủy , 0 = đang chờ , 1, chập nhật
    receivingObject: { type: Object,default:{"name":"note","address":"none"}}, // thông tin đối tượng giao hàng
    supplierObject: {type: String}, // thông tin đối tượng cung cấp
    info:  {type: String}, // thông tin thêm
    ofGarage: {type: Object, default:null}, // thông tin xuất từ garage nào
    receiptFrom:  {type: Object, default:null}, // nhập từ kho nào đó , != null nếu nhập nội bộ
    totalMoneyNumber: {type: Number}, // tổng tiền bằng số
    totalMoneyString: {type: String}, // tổng tiền băng chữ
    voucherNumber :{type: String}, // số chứng tư
    receiptDate: {type: Date,default: Date.now},
    receiptDetail: {type:Array,default:[]},// 
    hostId: {type: mongoose.Types.ObjectId, ref: 'g_User'}, // thông tin chủ sở hữu
    createdBy: {type: mongoose.Types.ObjectId, ref: 'g_User'}, // thông tin nguòi tạo
    updatedBy: {type: mongoose.Types.ObjectId, ref: 'g_User'}, // thông tin nguời cập nhật cuối
    note:  { type: String}, // ghi chú 
  },
  { versionKey: false, timestamps: true }
);
/** @memberOf account */
WareHouseReceipt.statics.ObjectId = function (id) {
  return mongoose.Types.ObjectId(id);
};
WareHouseReceipt.statics.GenerateKeyCode = async function (){
  let countLoop =0;
  let lengthKey =5;
  let tempKey = "wareHouseReceipt_"+randomstring.generate(lengthKey);
  let tempItem = await _wareHouseReceipt.findOne({"code":tempKey});
  while(tempItem){
    if(countLoop > 10){
      lengthKey++;
      countLoop=0;
    }
    tempKey = "wareHouseReceipt_"+randomstring.generate(lengthKey);
    tempItem = await _wareHouseReceipt.findOne({"code":tempKey});
    countLoop++;
  }
  return tempKey;
};
const _wareHouseReceipt = mongoose.model("g_wareHouseReceipt", WareHouseReceipt);
module.exports = {
    WareHouseReceipt:  _wareHouseReceipt,
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
//   "voucherActual": 3,
//   "actual": 2,
//   "unitPrice": 12000,
//   "amount": 24000
//}