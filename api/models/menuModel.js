"use strict";
const mongoose = require("mongoose");
const serverData = require("../data/serverData");
const Menu = mongoose.Schema(
  {
    recordStatus: { type: Number, enum: serverData.recordStatus, default: serverData.recordStatus[1] }, // trạng thais của bản ghi , 1 là hoạt động , 0 đã xóa
    code: { type: String, lowercase: true, index: { unique: true }},
    name: { type: String },
    router: { type: String}, // địa chỉ
    icon: { type: String },
    enable: { type: Boolean, default: false },
    apis:{ type: Array },
    children:{ type: Array },
    description: { type: String },
  },
  { versionKey: false, timestamps: true }
);
/** @memberOf account */
Menu.statics.ObjectId = function (id) {
  return mongoose.Types.ObjectId(id);
};
const _menu = mongoose.model("g_MenuData", Menu);
module.exports = {
    Menu: _menu,
};