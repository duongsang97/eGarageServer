"use strict";
const mongoose = require("mongoose");
const serverData = require("../data/serverData");
const Users = mongoose.Schema(
  {
    recordStatus: { type: Number, enum: serverData.recordStatus, default: serverData.recordStatus[1] }, // trạng thais của bản ghi , 1 là hoạt động , 0 đã xóa
    userName: { type: String, lowercase: true, index: { unique: true } }, // tên đăng nhập
    password: { type: String, default: serverData.passWordDefauld }, // mật khẩu
    status: { type: Object, enum: serverData.userStatus, default: serverData.userStatus[0]}, // trạng thái tài khoản
    userType:{type: Object,enum : serverData.userType}, // loại tài khoản
    profile: { type: mongoose.Types.ObjectId, ref: 'g_Profile' }, // liên kêt với profile
  },
  { versionKey: false, timestamps: true }
);
/** @memberOf account */
Users.statics.ObjectId = function (id) {
  return mongoose.Types.ObjectId(id);
};
const _users = mongoose.model("g_User", Users);
module.exports = {
  Users: _users,
};