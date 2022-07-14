"use strict";

const mongoose = require("mongoose");
const serverData = require("../../data/serverData");
const randomstring = require("randomstring");
const BankAccount = mongoose.Schema(
    {
        recordStatus: { type: Number, enum: serverData.recordStatus, default: serverData.recordStatus[1] }, // trạng thais của bản ghi , 1 là hoạt động , 0 đã xóa
        hostId: { type: mongoose.Types.ObjectId, ref: 'g_User' }, // thông tin chủ sở hữu
        ofGarage: { type: Object }, // của garage nào

        code: { type: String, index: { unique: true } }, // mã  
        name: { type: String }, //Tên ngân hàng
        bankName: { type: String }, //Tên ngân hàng
        bankNo: { type: String }, // Số tài khoản
        ownerName: { type: String }, // Tên chủ sở hữu
        note: { type: String },
        createdBy: { type: mongoose.Types.ObjectId, ref: 'g_User', immutable: true, select: false }, // liên kêt với profile

        updatedBy: { type: mongoose.Types.ObjectId, ref: 'g_User' }, // liên kêt với profile
    },
    { versionKey: false, timestamps: true }
);
/** @memberOf account */
BankAccount.statics.ObjectId = function (id) {
    return mongoose.Types.ObjectId(id);
};
BankAccount.statics.GenerateKeyCode = async function () {
    var d = new Date();
    var sDate = d.getFullYear() + "" + ("0" + (d.getMonth() + 1)).slice(-2) + "" + ("0" + d.getDate()).slice(-2);
    let countLoop = 0;
    let lengthKey = 5;
    let tempKey = sDate + "_BA_" + randomstring.generate(lengthKey);
    let tempItem = await _bankAccount.findOne({ "code": tempKey, "recordStatus": 1 });
    while (tempItem) {
        if (countLoop > 10) {
            lengthKey++;
            countLoop = 0;
        }
        tempKey = sDate + "_BA_" + randomstring.generate(lengthKey);
        tempItem = await _bankAccount.findOne({ "code": tempKey });
        countLoop++;
    }
    return tempKey;
};
const _bankAccount = mongoose.model("g_BankAccount", BankAccount);
module.exports = {
    BankAccount: _bankAccount,
};