"use strict";
const Profile = require("../../models/profileModel").Profile;
const Position = require("../../models/attendance/positionModel").Position;
const Garage = require("../../models/garages/garageModel").Garage;
const Users = require("../../models/userModel").Users;
var Excel = require('exceljs');
var formidable = require('formidable');
const serverData = require("../../data/serverData");
const fs = require('fs');
const { profile } = require("console");
const ObjectId = require('mongoose').Types.ObjectId;

function ProfileController() {
    return {
        /** @memberOf ServiceManagerController
         * @description List all building
         * @param req
         * @param res
         * @returns {Promise<any>}
         */
        list: (req, res) => {
            try {
                if (req.user) {
                    let hostId = req.user.hostId || req.user._id;
                    let perPage = req.params.perPage || 0; // số lượng sản phẩm xuất hiện trên 1 page
                    let page = req.params.page || 0; // trang
                    let keyword = req.query.keyword || "";
                    let positionCode = req.query.positionCode || "";
                    let query = [
                        {
                            $or: [{ "name": { $regex: keyword } }, { "code": { $regex: keyword } }]
                        },
                        { "recordStatus": 1 },
                        { "hostId": hostId },
                    ]
                    if (positionCode) {
                        query.push({ "position.code": positionCode })
                    }
                    if (perPage === 0 || page === 0) {
                        Profile.find({
                            $and: query
                        }).exec((err, items) => {
                            Profile.countDocuments((err, count) => { // đếm để tính có bao nhiêu trang
                                if (err) {
                                    return res.json({ s: 1, msg: "không tìm thấy dữ liệu", data: err });
                                }
                                return res.json({ s: 0, msg: "Thành công", data: items });
                            });
                        });
                    }
                    else {
                        Profile.find({
                            $and: [
                                { "recordStatus": 1 },
                                { "hostId": hostId },
                            ]
                        }).skip((perPage * page) - perPage).limit(perPage).exec((err, items) => {
                            Profile.countDocuments((err, count) => { // đếm để tính có bao nhiêu trang
                                if (err) {
                                    return res.json({ s: 1, msg: "không tìm thấy dữ liệu", data: err });
                                }
                                return res.json({ s: 0, msg: "Thành công", data: items });
                            });
                        });
                    }

                }
                else {
                    res.json({ s: 1, msg: "không tìm thấy dữ liệu", data: null });
                }
            }
            catch (ex) {
                res.json({ s: 1, msg: "Có lỗi xảy ra khi xử lý dữ liệu", data: ex });
            }
        },

        dashboard: async (req, res) => {
            try {
                if (req.user) {
                    let hostId = req.user.hostId || req.user._id;
                    let keyword = req.query.keyword || "";
                    let garageSelected = req.query.garageSelected || "";
                    let data1 = [];
                    let data2 = [];
                    let data3 = [];
                    let data4 = [];
                    let query = [
                        { "recordStatus": 1 },
                        { "hostId": hostId },
                    ]
                    if (garageSelected) {
                        query.push({
                            $or: [{ "ofGarage": {} }, { "ofGarage": null }, { "ofGarage.code": garageSelected }],
                        })
                    }
                    let listEmp = await Profile.find({
                        $and: query
                    });

                    let listPosition = await Position.find({
                        $and: [
                            { "recordStatus": 1 },
                            { "hostId": hostId }
                        ]
                    });

                    let listGarage = await Garage.find({
                        $and: [
                            { "recordStatus": 1 },
                            { "hostId": hostId }
                        ]
                    });
                    let value1 = 0;
                    let value2 = 0;
                    let total = 0;
                    total = listEmp.length;
                    let listActive = listEmp.filter(e => e.workStatus.code === '01');

                    value1 = listEmp.filter(e => e.workStatus.code === '01').length;
                    value2 = listEmp.filter(e => e.workStatus.code === '02').length;

                    data1.push({ code: 'TKNV', name: 'Thống kê Nhân viên', total: total, value1: value1, value2: value2 });

                    total = listActive.length;
                    value1 = listActive.filter(e => e.workType.code === '01').length;
                    value2 = listActive.filter(e => e.workType.code === '02').length;

                    data2.push({ code: 'HTLV', name: 'Hình thức làm việc', total: total, value1: value1, value2: value2 });

                    listPosition.forEach(el => {
                        total = listActive.filter(e => e.position && e.position.code === el.code).length;
                        value1 = listActive.filter(e => e.position && e.position.code === el.code && e.workType.code === '01').length;
                        value2 = listActive.filter(e => e.position && e.position.code === el.code && e.workType.code === '02').length;
                        data3.push({ code: el.code, name: el.name, total: total, value1: value1, value2: value2 });
                    })
                    listGarage.forEach(el => {
                        total = listActive.filter(e => e.workPlace && e.workPlace[0].code == el.code).length;
                        value1 = listActive.filter(e => e.workPlace && e.workPlace[0].code == el.code && e.workType.code === '01').length;
                        value2 = listActive.filter(e => e.workPlace && e.workPlace[0].code == el.code && e.workType.code === '02').length;
                        data4.push({ code: el.code, name: el.name, total: total, value1: value1, value2: value2 });
                    })

                    return res.json({ s: 0, msg: "Thành công", data1: data1, data2: data2, data3: data3, data4: data4 });

                }
                else {
                    res.json({ s: 1, msg: "không tìm thấy dữ liệu", data: null });
                }
            }
            catch (ex) {
                res.json({ s: 1, msg: "Có lỗi xảy ra khi xử lý dữ liệu", data: ex });
            }
        },
        getOne: (req, res) => {
            try {
                if (req.user) {
                    let hostId = Profile.ObjectId(req.user.hostId || req.user._id); // lấy dữ liệu của chủ garage
                    let keyword = req.query.keyword || "";
                    Profile.findOne({
                        $and: [
                            {
                                $or: [{ "_id": ObjectId.isValid(keyword) ? Profile.ObjectId(keyword) : null }, { "code": keyword }]
                            },
                            { "recordStatus": 1, "hostId": hostId }
                        ]
                    }).then(result => {
                        if (result) {
                            return res.json({ s: 0, msg: "Thành công", data: result || {}, listCount: (result || {}).length });
                        }
                        else {
                            res.json({ s: 1, msg: "không tìm thấy dữ liệu", data: null });
                        }
                    });
                }
                else {
                    res.json({ s: 1, msg: "không tìm thấy dữ liệu", data: null });
                }
            }
            catch (ex) {
                res.json({ s: 1, msg: "Có lỗi xảy ra khi xử lý dữ liệu", data: null });
            }
        },
        create: async (req, res) => {
            try {
                if (req.user && req.body) {
                    let hostId = req.user.hostId || req.user._id;
                    let data = JSON.parse((req.body.data) || "");
                    data.createdBy = Profile.ObjectId(req.user._id);
                    data.createdDate = Date.now();
                    data.hostId = Profile.ObjectId(hostId);

                    var validation = Profile.Validation(data);
                    if (validation !== '') {
                        return res.json({ s: 1, msg: validation, data: null });
                    }

                    let tempItem = await Profile.findOne({ "idNo": data.idNo, "recordStatus": 1 });
                    if (tempItem) {
                        return res.json({ s: 1, msg: "CMND/CCCD này đã tồn tại", data: null });
                    }
                    let avatar = (req.files && req.files.avatar) ? req.files.avatar : [];
                    let imageIDR = (req.files && req.files.imageIDR) ? req.files.imageIDR : [];
                    let imageIDL = (req.files && req.files.imageIDL) ? req.files.imageIDL : [];
                    try {
                        // xử lý hình ảnh garage
                        if (avatar && avatar.length > 0) {
                            data.avatar = avatar[0].path;
                        }
                        // xử lý CMND
                        if (imageIDR && imageIDR.length > 0) {
                            data.imageIDR = imageIDR[0].path;
                        }
                        if (imageIDL && imageIDL.length > 0) {
                            data.imageIDL = imageIDL[0].path;
                        }
                    }
                    catch (ex) {
                        console.log(ex);
                    }
                    if (!req.body.code) {
                        data.code = await Profile.GenerateKeyCode();
                    }
                    Profile.create(data, function (err, small) {
                        if (err) {
                            let errMsg = "";
                            if (err.code === 11000) {
                                errMsg = "Trùng mã";
                            }
                            else {
                                errMsg = err;
                            }
                            return res.json({ s: 1, msg: errMsg, data: null });
                        }
                        else {

                            if (small) {
                                let user = {
                                    recordStatus: 1,
                                    userName: small.idNo,
                                    password: '123',
                                    status: { code: "active", name: "Kích hoạt" },
                                    userType: { code: "employee", name: "Nhân viên" },
                                    profile: Users.ObjectId(small._id),
                                    hostId: hostId
                                };
                                Users.create(user, function (err, small) {
                                    if (err) {
                                        let errMsg = "";
                                        if (err.code === 11000) {
                                            errMsg = "Trùng mã";
                                        }
                                        else {
                                            errMsg = err;
                                        }
                                    }
                                    else {
                                    }
                                });
                            }
                            return res.json({ s: 0, msg: "Thành công", data: small });
                        }
                    });
                }
                else {
                    return res.json({ s: 1, msg: "không tìm thấy dữ liệu", data: null });
                }
            }
            catch (ex) {
                return res.json({ s: 1, msg: "Có lỗi xảy ra khi xử lý dữ liệu", data: ex });
            }
        },
        update: (req, res) => {
            try {
                let data = JSON.parse((req.body.data) || "");
                let avatar = (req.files && req.files.avatar) ? req.files.avatar : [];
                let imageIDR = (req.files && req.files.imageIDR) ? req.files.imageIDR : [];
                let imageIDL = (req.files && req.files.imageIDL) ? req.files.imageIDL : [];
                if (req.user && data) {
                    if (data._id && ObjectId.isValid(data._id)) {
                        data.updatedBy = Profile.ObjectId(req.user._id);
                        try {
                            // xử lý hình ảnh garage
                            if (avatar && avatar.length > 0) {
                                data.avatar = avatar[0].path;
                            }
                            // xử lý CMND
                            if (imageIDR && imageIDR.length > 0) {
                                data.imageIDR = imageIDR[0].path;
                            }
                            if (imageIDL && imageIDL.length > 0) {
                                data.imageIDL = imageIDL[0].path;
                            }
                        }
                        catch (ex) {
                            console.log(ex);
                        }

                        //delete req.body[createdBy]; // xóa ko cho cập nhật tránh lỗi mất dữ liệu người dùng
                        Profile.findByIdAndUpdate(data._id, data, function (err, doc, re) {
                            if (err) {
                                return res.json({ s: 1, msg: "Thất bại", data: err });
                            }
                            else {
                                return res.json({ s: 0, msg: "Thành công", data: data });
                            }
                        });
                    }
                    else {
                        res.json({ s: 1, msg: "không tìm thấy dữ liệu", data: null });
                    }

                }
                else {
                    res.json({ s: 1, msg: "không tìm thấy dữ liệu", data: null });
                }
            }
            catch (ex) {
                res.json({ s: 1, msg: "Có lỗi xảy ra khi xử lý dữ liệu", data: ex });
            }
        },
        delete: (req, res) => {
            try {
                if (req.user && req.body) {
                    if (req.body._id && ObjectId.isValid(req.body._id)) {
                        req.body.updatedBy = Profile.ObjectId(req.user._id);
                        Profile.findById(req.body._id, function (err, doc) {
                            if (err) {
                                return res.json({ s: 1, msg: "Thất bại", data: err });
                            }
                            else {
                                if (doc) {
                                    doc.recordStatus = 0;
                                    Profile.findByIdAndUpdate(req.body._id, doc, function (err, doc, re) {
                                        if (err) {
                                            return res.json({ s: 1, msg: "Đã có lỗi xảy ra khi xóa dữ liệu!", data: err });
                                        }
                                        else {
                                            doc.recordStatus = 0;

                                            return res.json({ s: 0, msg: "Thành công", data: doc });
                                        }
                                    });
                                }
                                else {
                                    res.json({ s: 1, msg: "không tìm thấy dữ liệu", data: null });
                                }
                            }
                        });
                    }

                }
                else {
                    res.json({ s: 1, msg: "không tìm thấy dữ liệu", data: null });
                }
            }
            catch (ex) {
                res.json({ s: 1, msg: "Có lỗi xảy ra khi xử lý dữ liệu", data: ex });
            }
        },

    };
}

module.exports = new ProfileController();