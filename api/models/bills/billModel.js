"use strict";
const mongoose = require("mongoose");
const serverData = require("../../data/serverData");
const randomstring = require("randomstring");
const Bill = mongoose.Schema(
  {
    recordStatus: { type: Number, enum: serverData.recordStatus, default: serverData.recordStatus[1] }, // trạng thais của bản ghi , 1 là hoạt động , 0 đã xóa
    code:{ type: String, index: { unique: true }}, // mã 
    customer: { type: Object }, // khách hàng {"code":"có thì chèn ko, vãn lai chèn null","name":"Tên khách hàng", "address":"địa chỉ","numberPhone":"0987112556"}
    productDetail: {type: Array}, // sản phẩm mua chi tiết ở phía dưới
    serviceDetail: {type: Array}, // dịch vụ mua chi tiết ở phía dưới
    vehicle: {type: Object}, // thông tin xe 
    discountType :{type:Object}, // loại chiết khấu lấy từ masterdata 
    discountUnit:{type:Object}, // kiểu giảm giá, tiền mặt hoặc % dư liệu lấy từ masterdata // nếu discountType chọn thủ công --> mới có tác dụng
    discountValue:{type:Number}, // giá trị giảm nếu discountType chọn thủ công --> mới có tác dụng
    insurance:{type:Object}, // thông tin bảo hiểm
    tax:{type:Number}, //thuế tính theo %
    prepaidExpenses:{type: Number}, // tổng tiền trước thuế
    discountFinal:{type: Number}, // tổng số tiền được giảm trừ
    totalCost:{type: Number}, // tổng số tiền bằng số
    totalCostString:{type: String}, // tổng số tiền bằng chữ
    commissionCost:{type:Number}, // tiền hoa hồng
    referral: {type:Object}, // thông tin người giới thiệu 
    paymentHistory:{type: Array}, // lịch sử thanh toán
    ticketInfo: {type: mongoose.Types.ObjectId, ref: 'g_Ticket'}, // thông tin bill đi kèm
    hostId: {type: mongoose.Types.ObjectId, ref: 'g_User'}, // thông tin chủ sở hữu
    createdBy: {type: mongoose.Types.ObjectId, ref: 'g_User'}, // thông tin nguòi tạo
    updatedBy: {type: mongoose.Types.ObjectId, ref: 'g_User'}, // thông tin nguời cập nhật cuối
    note:  { type: String}, // ghi chú 

    //Thịnh add
    totalAmountOwed:{type: Number}, // tổng số còn nợ
  },
  { versionKey: false, timestamps: true }
);
/** @memberOf account */
Bill.statics.ObjectId = function (id) {
  return mongoose.Types.ObjectId(id);
};
Bill.statics.GenerateKeyCode = async function (){
  let countLoop =0;
  let lengthKey =5;
  let tempKey = "bill"+randomstring.generate(lengthKey);
  let tempItem = await _bill.findOne({"code":tempKey});
  while(tempItem){
    if(countLoop > 10){
      lengthKey++;
      countLoop=0;
    }
    tempKey = "bill_"+randomstring.generate(lengthKey);
    tempItem = await _bill.findOne({"code":tempKey});
    countLoop++;
  }
  return tempKey;
};
const _bill = mongoose.model("g_Bill", Bill);
module.exports = {
    Bill: _bill,
};

// {
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

// {
//   "service": {
//     "code": "mã sp",
//     "name": "tên sản phẩm"
//   },
//   "actual": 2,
//   "unitPrice": 12000,
//   "amount": 24000
//}

// struct thông tin xe
// {
//     "licensePlates": "Biển số xe",
//     "automaker": {
//       "code": "mã hãng xe",
//       "name": "tên hãng xe"
//     },
//     "carModel": {
//       "code": "mã dòng xe",
//       "name": "tên dfong xe",
//       "automaker": {
//         "code": "mã hàng xe",
//         "name": "Tên hãng xe"
//       }
//     },
//     "carColor": {
//       "code": "mã màu",
//       "name": "Tên màu",
//       "codeColor": "#FFFFF"
//     },
//     "odo":5637,
//      "customer":{"code":"mã khách hàng","name":"tên khách hàng"}
//   }
