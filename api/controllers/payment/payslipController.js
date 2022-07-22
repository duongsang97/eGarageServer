"use strict";
const Payslip = require("../../models/payment/payslipModel").Payslip;
const WareHouseReceipt = require("../../models/storeManage/wareHouseReceipt/wareHouseReceiptModel").WareHouseReceipt;
var Excel = require('exceljs');
var formidable = require('formidable');
const serverData = require("../../data/serverData");
const fs = require('fs');
const ObjectId = require('mongoose').Types.ObjectId;

function PayslipController() {
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
                    let garageSelected = req.query.garageSelected || "";
                    if (perPage === 0 || page === 0) {
                        Payslip.find({
                            $and: [
                                {
                                    $or: [{ "ofGarage": {} }, { "ofGarage": null }, { "ofGarage.code": garageSelected }],
                                },
                                {
                                    $or: [{ "name": { $regex: keyword } }, { "code": { $regex: keyword } }]
                                },
                                { "recordStatus": 1 },
                                { "hostId": hostId },
                            ]
                        }).exec((err, items) => {
                            Payslip.countDocuments((err, count) => { // đếm để tính có bao nhiêu trang
                                if (err) {
                                    return res.json({ s: 1, msg: "không tìm thấy dữ liệu", data: err });
                                }
                                return res.json({ s: 0, msg: "Thành công", data: items });
                            });
                        });
                    }
                    else {
                        Payslip.find({
                            $and: [
                                { "recordStatus": 1 },
                                { "hostId": hostId },
                            ]
                        }).skip((perPage * page) - perPage).limit(perPage).exec((err, items) => {
                            Payslip.countDocuments((err, count) => { // đếm để tính có bao nhiêu trang
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
                res.json({ s: 1, msg: "Có lỗi xảy ra khi xử lý dữ liệu", data: null });
            }
        },
        getOne: (req, res) => {
            try {
                if (req.user) {
                    let hostId = Payslip.ObjectId(req.user.hostId || req.user._id); // lấy dữ liệu của chủ garage
                    let keyword = req.query.keyword || "";
                    Payslip.findOne({
                        $and: [
                            {
                                $or: [{ "_id": ObjectId.isValid(keyword) ? Payslip.ObjectId(keyword) : null }, { "code": keyword }]
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
                    req.body.createdBy = Payslip.ObjectId(req.user._id);
                    req.body.createdDate = Date.now();
                    req.body.hostId = Payslip.ObjectId(hostId);

                    if (req.body.reason && req.body.reason.code === '01') {
                        let tempItem = await WareHouseReceipt.findOne({ "code": req.body.voucherCode, "recordStatus": 1 });
                        if (!tempItem) {
                            return res.json({ s: 1, msg: "Không tìm thấy phiếu xuất [" + req.body.voucherCode + "] trong hệ thống!", data: null });
                        }

                        if (tempItem.totalAmountOwed <= 0) {
                            return res.json({ s: 1, msg: "Chứng từ này đã hoàn thành thanh toán!", data: null });
                        }
                        tempItem.totalAmountOwed -= req.body.amount;
                        if (tempItem.totalAmountOwed < 0) {
                            return res.json({ s: 1, msg: "Số tiền cần thanh toán không được lớn hơn số tiền cần phải trả!", data: null });
                        }
                    }
                    //kiểm tra có tồn tại mã phiếu


                    if (!req.body.code) {
                        req.body.code = await Payslip.GenerateKeyCode();
                    }
                    Payslip.create(req.body, function (err, small) {
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

                                if (small.reason && small.reason.code === '01') {
                                    WareHouseReceipt.findByIdAndUpdate(tempItem._id, tempItem, function (err2, doc2, re2) {
                                        if (err2) {
                                            return res.json({ s: 1, msg: "Thất bại", data: err2 });
                                        }
                                        else {
                                            if (doc2) {
                                                return res.json({ s: 0, msg: "Thành công", data: small });
                                            }
                                            else {
                                                res.json({ s: 1, msg: "không tìm thấy dữ liệu hóa đơn", data: null });
                                            }
                                        }
                                    });
                                }

                            }
                            else {
                                return res.json({ s: 1, msg: "Đã có lỗi xảy ra!", data: small });
                            }
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
                if (req.user && req.body) {
                    if (req.body._id && ObjectId.isValid(req.body._id)) {
                        let hostId = req.user.hostId || req.user._id;
                        req.body.updatedBy = Payslip.ObjectId(req.user._id);
                        //delete req.body[createdBy]; // xóa ko cho cập nhật tránh lỗi mất dữ liệu người dùng
                        Payslip.findByIdAndUpdate(req.body._id, req.body, function (err, doc, re) {
                            if (err) {
                                return res.json({ s: 1, msg: "Thất bại", data: err });
                            }
                            else {
                                if (doc) {
                                    return res.json({ s: 0, msg: "Thành công", data: doc });
                                }
                                else {
                                    res.json({ s: 1, msg: "không tìm thấy dữ liệu", data: null });
                                }
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
                    //delete req.body[createdBy]; // xóa ko cho cập nhật tránh lỗi mất dữ liệu người dùng
                    if (req.body._id && ObjectId.isValid(req.body._id)) {
                        let hostId = req.user.hostId || req.user._id;
                        req.body.updatedBy = Payslip.ObjectId(req.user._id);
                        Payslip.findById(req.body._id, function (err, doc) {
                            if (err) {
                                return res.json({ s: 1, msg: "Thất bại", data: err });
                            }
                            else {
                                if (doc) {
                                    doc.recordStatus = 0;
                                    Payslip.findByIdAndUpdate(req.body._id, doc, function (err, doc, re) {
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
        getListVoucherByCode: (req, res) => {
            try {
                if (req.user) {
                    let hostId = req.user.hostId || req.user._id;
                    let perPage = req.params.perPage || 0; // số lượng sản phẩm xuất hiện trên 1 page
                    let page = req.params.page || 0; // trang
                    let keyword = req.query.keyword || "";
                    let garageSelected = req.query.garageSelected || "";
                    if (perPage === 0 || page === 0) {
                        WareHouseReceipt.find({
                            $and: [
                                {
                                    $or: [{ "ofGarage": {} }, { "ofGarage": null }, { "ofGarage.code": garageSelected }],
                                },
                                { "code": { $regex: keyword } },
                                { "totalAmountOwed": { $gte: 0 } },
                                { "recordStatus": 1 },
                                { "hostId": hostId },
                            ]
                        }).exec((err, items) => {
                            WareHouseReceipt.countDocuments((err, count) => { // đếm để tính có bao nhiêu trang
                                if (err) {
                                    return res.json({ s: 1, msg: "không tìm thấy dữ liệu", data: err });
                                }
                                return res.json({ s: 0, msg: "Thành công", data: items });
                            });
                        });
                    }
                    else {
                        WareHouseReceipt.find({
                            $and: [
                                {
                                    $or: [{ "ofGarage": {} }, { "ofGarage": null }, { "ofGarage.code": garageSelected }],
                                },
                                { "code": { $regex: keyword } },
                                { "totalAmountOwed": { $gte: 0 } },
                                { "recordStatus": 1 },
                                { "hostId": hostId },
                            ]
                        }).skip((perPage * page) - perPage).limit(perPage).exec((err, items) => {
                            WareHouseReceipt.countDocuments((err, count) => { // đếm để tính có bao nhiêu trang
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
                res.json({ s: 1, msg: "Có lỗi xảy ra khi xử lý dữ liệu", data: null });
            }
        },
    };
}

module.exports = new PayslipController();