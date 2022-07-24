"use strict";
const Bill = require("../../models/bills/billModel").Bill;
const CustomerInfo = require("../../models/crm/customerInfoModel").CustomerInfo;
const GroupCustomer = require("../../models/crm/groupCustomerModel").GroupCustomer;
const Promotion = require("../../models/promotion/promotionModel").Promotion;
var Excel = require('exceljs');
var formidable = require('formidable');
const serverData = require("../../data/serverData");
const fs = require('fs');
const ObjectId = require('mongoose').Types.ObjectId;

function BillController() {
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
                    Bill.find({
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
                    }).sort({ "updatedBy": -1 }).skip((perPage * page) - perPage).limit(perPage).exec((err, items) => {
                        Bill.countDocuments((err, count) => { // đếm để tính có bao nhiêu trang
                            if (err) {
                                return res.json({ s: 1, msg: "không tìm thấy dữ liệu", data: err });
                            }
                            let _data = [];
                            items.forEach((e) => {
                                let _temp = { ...e["_doc"] };
                                _temp["paymentStatus"] = 0; // chưa thanh toán
                                if (_temp.totalAmountOwed == 0) {
                                    _temp["paymentStatus"] = 1; // đã thanh toán
                                }
                                else if (_temp.totalAmountOwed < _temp.totalCost && _temp.totalAmountOwed != 0) {
                                    _temp["paymentStatus"] = -1; // đang nợ
                                }
                                _data.push(_temp);
                            });
                            return res.json({ s: 0, msg: "Thành công", data: _data || [] });
                        });
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
        getOne: (req, res) => {
            try {
                if (req.user) {
                    let hostId = Bill.ObjectId(req.user.hostId || req.user._id); // lấy dữ liệu của chủ garage
                    let keyword = req.query.keyword || "";
                    Bill.findOne({
                        $and: [
                            {
                                $or: [{ "_id": ObjectId.isValid(keyword) ? Bill.ObjectId(keyword) : null }, { "code": keyword }]
                            },
                            { "recordStatus": 1, "hostId": hostId }
                        ]
                    }).then(result => {

                        if (result) {
                            let _temp = { ...result["_doc"] };
                            _temp["paymentStatus"] = 0; // chưa thanh toán
                            if (_temp.totalAmountOwed == 0) {
                                _temp["paymentStatus"] = 1; // đã thanh toán
                            }
                            else if (_temp.totalAmountOwed < _temp.totalCost && _temp.totalAmountOwed != 0) {
                                _temp["paymentStatus"] = -1; // đang nợ
                            }
                            return res.json({ s: 0, msg: "Thành công", data: _temp || {}, listCount: (_temp || {}).length });
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
                    req.body.createdBy = Bill.ObjectId(req.user._id);
                    req.body.updatedBy = Bill.ObjectId(req.user._id);
                    req.body.hostId = Bill.ObjectId(hostId);
                    req.body.totalAmountOwed = req.body.totalCost || 0;
                    if (!req.body.code) {
                        req.body.code = await Bill.GenerateKeyCode();
                    }
                    Bill.create(req.body, function (err, small) {
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

        calculateBill: async (req, res) => {
            try {
                if (req.user && req.body) {
                    let data = req.body;
                    data.discountByCustomerGroupValue = 0;
                    data.voucherValue = 0;
                    data.taxValue = 0;
                    let customerInfo = await CustomerInfo.findOne({ "phoneNumber": data.customer.numberPhone, "recordStatus": 1 });
                    if (customerInfo && customerInfo.group) {
                        let groupCus = await GroupCustomer.findOne({ "code": customerInfo.group.code, "recordStatus": 1 });
                        if (groupCus && groupCus.discount > 0) {
                            data.discountByCustomerGroupValue = data.prepaidExpenses * groupCus.discount / 100;
                        }
                    }
                    if (data.voucherApply && data.voucherApply.code !== '') {
                        let promotion = await Promotion.findOne({ "code": data.voucherApply.code, "recordStatus": 1 });
                        if (promotion) {
                            if (promotion.promotionType && promotion.promotionType.code === '01') {
                                if (promotion.valueType && promotion.valueType.code === '01') {
                                    data.voucherValue = data.prepaidExpenses * promotion.value / 100;
                                    if (promotion.maxValue > 0 && data.voucherValue < promotion.maxValue) {
                                        data.voucherValue = promotion.maxValue;
                                    }
                                }
                                else if (promotion.valueType && promotion.valueType.code === '02') {
                                    data.voucherValue = promotion.value;
                                }
                            }
                            else if (promotion.promotionType && promotion.promotionType.code === '02') {
                                if (data.prepaidExpenses >= promotion.target) {
                                    if (promotion.valueType && promotion.valueType.code === '01') {
                                        data.voucherValue = data.prepaidExpenses * promotion.value / 100;
                                        if (promotion.maxValue > 0 && data.voucherValue < promotion.maxValue) {
                                            data.voucherValue = promotion.maxValue;
                                        }
                                    }
                                    else if (promotion.valueType && promotion.valueType.code === '02') {
                                        data.voucherValue = promotion.value;
                                    }
                                }

                            }
                        }
                    }

                    data.discountFinal = data.voucherValue + data.discountByCustomerGroupValue;

                    data.totalCost = data.prepaidExpenses - data.discountFinal ;
                    if(data.totalCost < 0){
                        data.totalCost = 0;
                    }
                    
                    if(data.tax > 0){
                        data.taxValue = data.prepaidExpenses * data.tax / 100;
                        data.totalCost += data.taxValue;
                    }

                    return res.json({ s: 0, msg: "Thành công", data: data });
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
                        req.body.updatedBy = Bill.ObjectId(req.user._id);
                        delete req.body.totalAmountOwed; // không cho phép cập nhật
                        //delete req.body[createdBy]; // xóa ko cho cập nhật tránh lỗi mất dữ liệu người dùng
                        Bill.findByIdAndUpdate(req.body._id, req.body, function (err, doc, re) {
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
                        req.body.updatedBy = Bill.ObjectId(req.user._id);
                        Bill.findById(req.body._id, function (err, doc) {
                            if (err) {
                                return res.json({ s: 1, msg: "Thất bại", data: err });
                            }
                            else {

                                if (doc) {
                                    doc.recordStatus = 0;
                                    Bill.findByIdAndUpdate(req.body._id, doc, function (err, doc, re) {
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
    };
}

module.exports = new BillController();