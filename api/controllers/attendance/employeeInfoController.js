"use strict";
const EmployeeInfo = require("../../models/attendance/employeeInfoModel").EmployeeInfo;
var Excel = require('exceljs');
var formidable = require('formidable');
const serverData = require("../../data/serverData");
const fs = require('fs');
const ObjectId = require('mongoose').Types.ObjectId;

function EmployeeInfoController() {
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
                    if (perPage === 0 || page === 0) {
                        EmployeeInfo.find({
                            $and: [
                                {
                                    $or: [{ "name": { $regex: keyword } }, { "code": { $regex: keyword } }]
                                },
                                { "recordStatus": 1 },
                                { "hostId": hostId },
                            ]
                        }).exec((err, items) => {
                            EmployeeInfo.countDocuments((err, count) => { // đếm để tính có bao nhiêu trang
                                if (err) {
                                    return res.json({ s: 1, msg: "không tìm thấy dữ liệu", data: err });
                                }
                                return res.json({ s: 0, msg: "Thành công", data: items });
                            });
                        });
                    }
                    else {
                        EmployeeInfo.find({
                            $and: [
                                { "recordStatus": 1 },
                                { "hostId": hostId },
                            ]
                        }).skip((perPage * page) - perPage).limit(perPage).exec((err, items) => {
                            EmployeeInfo.countDocuments((err, count) => { // đếm để tính có bao nhiêu trang
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
        getOne: (req, res) => {
            try {
                if (req.user) {
                    let hostId = EmployeeInfo.ObjectId(req.user.hostId || req.user._id); // lấy dữ liệu của chủ garage
                    let keyword = req.query.keyword || "";
                    EmployeeInfo.findOne({
                        $and: [
                            {
                                $or: [{ "_id": ObjectId.isValid(keyword) ? EmployeeInfo.ObjectId(keyword) : null }, { "code": keyword }]
                            },
                            { "recordStatus": 1, "hostId": hostId }
                        ]
                    }).then(result => {
                        return res.json({ s: 0, msg: "Thành công", data: result || {}, listCount: (result || {}).length });
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
        getWorkType: (req, res) => {
            try {
                if (req.user) {
                    return res.json({
                        s: 0, msg: "Thành công", data: serverData.workType,
                        listCount: serverData.workType.length
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
        getWorkStatus: (req, res) => {
            try {
                if (req.user) {
                    return res.json({
                        s: 0, msg: "Thành công", data: serverData.workStatus,
                        listCount: serverData.workStatus.length
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
                    data.createdBy = EmployeeInfo.ObjectId(req.user._id);
                    data.createdDate = Date.now();
                    data.hostId = EmployeeInfo.ObjectId(hostId);

                    let avatar = (req.files && req.files.avatar) ? req.files.avatar : [];
                    let files = (req.files && req.files.fileId) ? req.files.fileId : [];
                    try {
                        // xử lý hình ảnh garage
                        if (avatar && avatar.length > 0) {
                            data.avatar = avatar[0].path;
                        }
                        // xử lý logo
                        if (files && files.length) {
                            data.fileId = [];
                            for (let i = 0; i < files.length; i++) {
                                data.fileId.push(files[i].path);
                            }
                        }
                    }
                    catch (ex) {
                        console.log(ex);
                    }
                    if (!req.body.code) {
                        data.code = await EmployeeInfo.GenerateKeyCode();
                    }
                    EmployeeInfo.create(data, function (err, small) {
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
                            return res.json({ s: 0, msg: "Thành công", data: small });
                        }
                    });
                }
                else {
                    res.json({ s: 1, msg: "không tìm thấy dữ liệu", data: null });
                }
            }
            catch (ex) {
                res.json({ s: 1, msg: "Có lỗi xảy ra khi xử lý dữ liệu", data: ex });
            }
        },
        update: (req, res) => {
            try {
                let data = JSON.parse((req.body.data) || "");
                let avatar = (req.files && req.files.avatar) ? req.files.avatar : [];
                let files = (req.files && req.files.fileId) ? req.files.fileId : [];
                if (req.user && data) {
                    if (data._id && ObjectId.isValid(data._id)) {
                        data.updatedBy = EmployeeInfo.ObjectId(req.user._id);
                        try {
                            // xử lý hình ảnh garage
                            if (avatar && avatar.length > 0) {
                                data.avatar = avatar[0].path;
                            }
                            // xử lý logo
                            if (files && files.length) {
                                data.fileId = data.fileId || [];
                                files.forEach(fi => {
                                    data.fileId.push(fi.path);
                                });
                            }
                        }
                        catch (ex) {
                            console.log(ex);
                        }
                        //delete req.body[createdBy]; // xóa ko cho cập nhật tránh lỗi mất dữ liệu người dùng
                        EmployeeInfo.findByIdAndUpdate(data._id, data, function (err, doc, re) {
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
                        req.body.updatedBy = EmployeeInfo.ObjectId(req.user._id);
                        EmployeeInfo.findById(req.body._id, function (err, doc) {
                            if (err) {
                                return res.json({ s: 1, msg: "Thất bại", data: err });
                            }
                            else {
                                doc.recordStatus = 0;
                                EmployeeInfo.findByIdAndUpdate(req.body._id, doc, function (err, doc, re) {
                                    if (err) {
                                        return res.json({ s: 1, msg: "Đã có lỗi xảy ra khi xóa dữ liệu!", data: err });
                                    }
                                    else {
                                        doc.recordStatus = 0;

                                        return res.json({ s: 0, msg: "Thành công", data: doc });
                                    }
                                });
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
    };
}

module.exports = new EmployeeInfoController();