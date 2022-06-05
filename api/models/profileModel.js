"use strict";
const mongoose = require("mongoose");
const serverData = require("../data/serverData");
const Profile = mongoose.Schema(
  {
    recordStatus: { type: Number, enum: serverData.recordStatus, default: serverData.recordStatus[1] }, // trạng thais của bản ghi , 1 là hoạt động , 0 đã xóa
    firstName: { type: String}, 
    lastName: { type: String},
    gender: { type: Object, default: serverData.gender ,default:serverData.gender[0]}, // mật khẩu
    email:  { type: String}, 
    numberPhone:  { type: String}, 
    address: { type: Object}, 
    birthday: { type: String}, 
  },
  { versionKey: false, timestamps: true }
);
/** @memberOf account */
Profile.statics.ObjectId = function (id) {
  return mongoose.Types.ObjectId(id);
};
const _profile = mongoose.model("g_Profile", Profile);
module.exports = {
  Profile: _profile,
};