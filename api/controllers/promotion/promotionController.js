"use strict";
const Promotion = require("../../models/promotion/promotionModel").Promotion;
var Excel = require('exceljs');
var formidable = require('formidable');
const serverData = require("../../data/serverData");
const fs = require('fs');
const ObjectId = require('mongoose').Types.ObjectId;

function PromotionController() {
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
                        Promotion.find({
                            $and: [
                                {
                                    $or: [{ "name": { $regex: keyword } }, { "code": { $regex: keyword } }]
                                },
                                { "recordStatus": 1 },
                                { "hostId": hostId },
                            ]
                        }).exec((err, items) => {
                            Promotion.countDocuments((err, count) => { // đếm để tính có bao nhiêu trang
                                if (err) {
                                    return res.json({ s: 1, msg: "không tìm thấy dữ liệu", data: err });
                                }
                                return res.json({ s: 0, msg: "Thành công", data: items });
                            });
                        });
                    }
                    else {
                        Promotion.find({
                            $and: [
                                { "recordStatus": 1 },
                                { "hostId": hostId },
                            ]
                        }).skip((perPage * page) - perPage).limit(perPage).exec((err, items) => {
                            Promotion.countDocuments((err, count) => { // đếm để tính có bao nhiêu trang
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
                    let hostId = Promotion.ObjectId(req.user.hostId || req.user._id); // lấy dữ liệu của chủ garage
                    let keyword = req.query.keyword || "";
                    Promotion.findOne({
                        $and: [
                            {
                                $or: [{ "_id": ObjectId.isValid(keyword) ? Promotion.ObjectId(keyword) : null }, { "code": keyword }]
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
        getPromotionType: (req, res) => {
            try {
                if (req.user) {
                    return res.json({
                        s: 0, msg: "Thành công", data: serverData.promotionType,
                        listCount: serverData.promotionType.length
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
        getValueType: (req, res) => {
            try {
                if (req.user) {
                    return res.json({
                        s: 0, msg: "Thành công", data: serverData.promotionValueType,
                        listCount: serverData.promotionValueType.length
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
                    req.body.createdBy = Promotion.ObjectId(req.user._id);
                    req.body.createdDate = Date.now();
                    req.body.hostId = Promotion.ObjectId(hostId);
                    if (!req.body.code) {
                        req.body.code = await Promotion.GenerateKeyCode();
                    }
                    Promotion.create(req.body, function (err, small) {
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
                if (req.user && req.body) {
                    req.body.updatedBy = Promotion.ObjectId(req.user._id);
                    //delete req.body[createdBy]; // xóa ko cho cập nhật tránh lỗi mất dữ liệu người dùng
                    Promotion.findByIdAndUpdate(req.body._id, req.body, function (err, doc, re) {
                        if (err) {
                            return res.json({ s: 1, msg: "Thất bại", data: err });
                        }
                        else {
                            return res.json({ s: 0, msg: "Thành công", data: doc });
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
        delete: (req, res) => {
            try {
                if (req.user && req.body) {
                    req.body.updatedBy = Promotion.ObjectId(req.user._id);
                    //delete req.body[createdBy]; // xóa ko cho cập nhật tránh lỗi mất dữ liệu người dùng
                    Promotion.findById(req.body._id, function (err, doc) {
                        if (err) {
                            return res.json({ s: 1, msg: "Thất bại", data: err });
                        }
                        else {
                            doc.recordStatus = 0;
                            Promotion.findByIdAndUpdate(req.body._id, doc, function (err, doc, re) {
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
            catch (ex) {
                res.json({ s: 1, msg: "Có lỗi xảy ra khi xử lý dữ liệu", data: ex });
            }
        },
    };
}

module.exports = new PromotionController();