"use strict";
const mongoose = require("mongoose");
const serverData = require("../../data/serverData");
const randomstring = require("randomstring");
const Ticket = mongoose.Schema(
  {
    recordStatus: { type: Number, enum: serverData.recordStatus, default: serverData.recordStatus[1] }, // trạng thais của bản ghi , 1 là hoạt động , 0 đã xóa
    code: { type: String, index: { unique: true }}, // mã 
    appointmentTime: {type: Date}, // thời gia đặt lịch
    appointmentTimeInt: {type: Number}, // thời gian đặt lịch int format
    appointmentNote: {type: String}, // ghi chú lúc đặt lịch
    // thông tin khách hàng
    licensePlates: {type: String}, // biển số xe
    customer:{type: Object}, // đối tượng khách hàng {"customer":{"code":"mã khách hàng","name":"tên khách hàng"}}
    customerName: {type: String}, // tên khách hàng
    birthday:  { type: Date}, //ngày sinh
    phoneNumber: { type: String}, //SDT
    customerAddress: {type: String}, // địa chỉ
    customerNote: {type: String}, // khách hàng ghi chú
    //
    vehicle:{type:Object}, // thông tin xe
    receiveForVehicle:{type: Array}, // các đồ vật nhận khi tiếp nhận xe
    process:{type:Object,default:serverData.ticketProcess[0]}, // trạng thái ticket mặc định đặt lịch
    executors:{type:Array}, // người thực hiện [{"code":"mã nhân viên","name":"tên nhân viên"}]
    executorsFeedback:{type: Array}, // ghi chú của nhân viên kỹ thuật
    executorsNote: {type:String}, // free text
    level:{type:Number,default:0}, // 0,1,2,3 --> số càng cao ưu tiên càng lớn
    receivedDate:{type:Date}, // ngày nhận
    estimatedFinishDate:{type:Date}, // ngày bàn giao dự kiến
    changeHistory:{type: Array}, // lịch sử chỉnh sửa 

    ofGarage:{type:Object}, // làm việc ở garage nào. {code,name}
    billId: {type: mongoose.Types.ObjectId, ref: 'g_Bill'}, // thông tin bill đi kèm
    hostId: {type: mongoose.Types.ObjectId, ref: 'g_User'}, // thông tin chủ sở hữu
    createdBy: {type: mongoose.Types.ObjectId, ref: 'g_User'}, // thông tin nguòi tạo
    updatedBy: {type: mongoose.Types.ObjectId, ref: 'g_User'}, // thông tin nguời cập nhật cuối
    note:  { type: String}, // ghi chú 
    message: {type: Array}, // danh sách trao đổi
  },
  { versionKey: false, timestamps: true }
);
/** @memberOf account */
Ticket.statics.ObjectId = function (id) {
  return mongoose.Types.ObjectId(id);
};
Ticket.statics.GenerateKeyCode = async function (){
  let countLoop =0;
  let lengthKey =5;
  let tempKey = "ticket_"+randomstring.generate(lengthKey);
  let tempItem = await _ticket.findOne({"code":tempKey});
  while(tempItem){
    if(countLoop > 10){
      lengthKey++;
      countLoop=0;
    }
    tempKey = "ticket_"+randomstring.generate(lengthKey);
    tempItem = await _ticket.findOne({"code":tempKey});
    countLoop++;
  }
  return tempKey;
};
const _ticket = mongoose.model("g_Ticket", Ticket);
module.exports = {
    Ticket: _ticket,
};


/// receiveForVehicle
// {
//     "code":"mã"
//     "name":"Tên vật phẩm, tài liệu khi nhận",
//     "values":"số lượng, giá trị",
//     "note":"ghi chú",
//     "images":["link hình1","link hình 2"]
// }

//executorsFeedback
// [
//         {
//             "code":"mã",
//             "name":"Tên vật phẩm, tài liệu khi nhận",
//             "values":"số lượng, giá trị",
//             "note":"ghi chú",
//             "images":["link hình1","link hình 2"] 
//         },
//         {
//             "code":"mã",
//             "name":"Tên vật phẩm, tài liệu khi nhận",
//             "values":"số lượng, giá trị",
//             "note":"ghi chú",
//             "images":["link hình1","link hình 2"] 
//         }
//  ],
// }

//message

// [
//     {
//         "code":"mã",
//         "inProcess": {"code":"mã process","name":"tên process"},
//         "message":"nội dung trao đổi",
//         "createdBy" :"người gửi tin",
//         "createdAt": "thời gian trao đổi"
//     }
// ]