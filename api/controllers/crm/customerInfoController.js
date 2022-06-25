"use strict";
const CustomerInfo = require("../../models/crm/customerInfoModel").CustomerInfo;
var Excel = require('exceljs');
const serverData = require("../../data/serverData");
const { GroupCustomer } = require("../../models/crm/groupCustomerModel");
const ObjectId = require('mongoose').Types.ObjectId;
function CustomerInfoController() {
    return {
        /** @memberOf ServiceManagerController
         * @description List all building
         * @param reqs
         * @param res
         * @returns {Promise<any>}
         */
        list: (req, res) => {
            try {
                if (req.user) {
                    let perPage = req.params.perPage || 0; // số lượng sản phẩm xuất hiện trên 1 page
                    let page = req.params.page || 0; // trang
                    let hostId = req.user.hostId || req.user._id;
                    let keyword = req.query.keyword || "";
                    if (perPage === 0 || page === 0) {
                        CustomerInfo.find({
                            $and: [
                                {
                                    $or: [{ "name": { $regex: keyword } }, { "code": { $regex: keyword } }]
                                },
                                { "recordStatus": 1 },
                                { "hostId": hostId },
                            ]
                        }).exec((err, items) => {
                            CustomerInfo.countDocuments((err, count) => { // đếm để tính có bao nhiêu trang
                                if (err) {
                                    return res.json({ s: 1, msg: "không tìm thấy dữ liệu", data: err });
                                }
                                return res.json({ s: 0, msg: "Thành công", data: items });
                            });
                        });
                    }
                    else {
                        CustomerInfo.find({
                            $and: [
                                { "recordStatus": 1 },
                                { "hostId": hostId },
                            ]
                        }).skip((perPage * page) - perPage).limit(perPage).exec((err, items) => {
                            CustomerInfo.countDocuments((err, count) => { // đếm để tính có bao nhiêu trang
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
                    let hostId = CustomerInfo.ObjectId(req.user.hostId || req.user._id); // lấy dữ liệu của chủ garage
                    let keyword = req.body.keyword || "";
                    CustomerInfo.findOne({
                        $and: [
                            {
                                $or: [{ "_id": ObjectId.isValid(keyword) ? CustomerInfo.ObjectId(keyword) : null }, { "code": keyword }]
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
        create: async (req, res) => {
            try {
                if (req.user && req.body) {
                    let hostId = req.user.hostId || req.user._id;
                    req.body.createdBy = CustomerInfo.ObjectId(req.user._id);
                    req.body.createdDate = Date.now();
                    req.body.hostId = CustomerInfo.ObjectId(hostId);
                    if (!req.body.code) {
                        req.body.code = await CustomerInfo.GenerateKeyCode();
                    }
                    CustomerInfo.create(req.body, function (err, small) {
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
                    let hostId = req.user.hostId || req.user._id;
                    req.body.updatedBy = CustomerInfo.ObjectId(req.user._id);
                    //delete req.body[createdBy]; // xóa ko cho cập nhật tránh lỗi mất dữ liệu người dùng
                    CustomerInfo.findByIdAndUpdate(req.body._id, req.body, function (err, doc, re) {
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
                    let hostId = req.user.hostId || req.user._id;
                    //delete req.body[createdBy]; // xóa ko cho cập nhật tránh lỗi mất dữ liệu người dùng
                    CustomerInfo.findById(req.body._id, function (err, doc) {
                        if (err) {
                            return res.json({ s: 1, msg: "Thất bại", data: err });
                        }
                        else {
                            doc.recordStatus = 0;
                            CustomerInfo.findByIdAndUpdate(req.body._id, doc, function (err, doc, re) {
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
        exportExcel: (req, res) => {
            try {
                if (req.user) {
                    let hostId = req.user.hostId || req.user._id;
                    CustomerInfo.find({
                        $and: [
                            { "recordStatus": 1 },
                            { "hostId": hostId },
                        ]
                    }).exec((err, items) => {
                        CustomerInfo.countDocuments((err, count) => { // đếm để tính có bao nhiêu trang
                            if (err) {
                                return res.json({ s: 1, msg: "không tìm thấy dữ liệu", data: err });
                            }
                            if (count > 0) {
                                var filename = serverData.pathFolderExport + '/customerinfo/CustomerInfoList_' + new Date().getTime() + '.xlsx';
                                var workbook = new Excel.Workbook();
                                var worksheet = workbook.addWorksheet('Danh sách  khách hàng', { properties: { tabColor: { argb: 'FFC0000' } } });
                                worksheet.getCell(2, 2).value = "DANG SÁCH KHÁCH HÀNG";

                                var rowtitle = 4;
                                var col = 1;
                                var listcol = [];
                                worksheet.getRow(rowtitle).font = { bold: true };
                                worksheet.getCell(rowtitle, col++).value = "STT";
                                listcol.push({ code: col - 1, value: 10 });
                                worksheet.getCell(rowtitle, col++).value = "Yêu cầu \n(0: Thêm; 1: Sửa; -1: Xóa)";
                                listcol.push({ code: col - 1, value: 30 });
                                worksheet.getCell(rowtitle, col++).value = "Mã hệ thống";
                                listcol.push({ code: col - 1, value: 15 });
                                worksheet.getCell(rowtitle, col++).value = "Tên khách hàng";
                                listcol.push({ code: col - 1, value: 30 });
                                worksheet.getCell(rowtitle, col++).value = "Số điện thoại";
                                listcol.push({ code: col - 1, value: 20 });
                                worksheet.getCell(rowtitle, col++).value = "Email";
                                listcol.push({ code: col - 1, value: 20 });
                                worksheet.getCell(rowtitle, col++).value = "Ngày sinh";
                                listcol.push({ code: col - 1, value: 15 });
                                worksheet.getCell(rowtitle, col++).value = "Địa chỉ";
                                listcol.push({ code: col - 1, value: 30 });
                                worksheet.getCell(rowtitle, col++).value = "CMND/CCCD";
                                listcol.push({ code: col - 1, value: 15 });
                                worksheet.getCell(rowtitle, col++).value = "Nơi cấp";
                                listcol.push({ code: col - 1, value: 30 });
                                worksheet.getCell(rowtitle, col++).value = "STK ngân hàng";
                                listcol.push({ code: col - 1, value: 15 });
                                worksheet.getCell(rowtitle, col++).value = "Ngân hàng";
                                listcol.push({ code: col - 1, value: 15 });
                                worksheet.getCell(rowtitle, col++).value = "Ghi chú";
                                listcol.push({ code: col - 1, value: 30 });

                                var rowindex = rowtitle + 1;
                                items.forEach(function (el, index) {
                                    col = 1;
                                    worksheet.getCell(rowindex, col++).value = index + 1;
                                    worksheet.getCell(rowindex, col++).value = "";
                                    worksheet.getCell(rowindex, col++).value = el.code;
                                    worksheet.getCell(rowindex, col++).value = el.name;
                                    worksheet.getCell(rowindex, col++).value = el.phoneNumber;
                                    worksheet.getCell(rowindex, col++).value = el.email;
                                    worksheet.getCell(rowindex, col++).value = el.birthday;
                                    worksheet.getCell(rowindex, col++).value = el.address;
                                    worksheet.getCell(rowindex, col++).value = el.idNo;
                                    worksheet.getCell(rowindex, col++).value = el.idPlace;
                                    worksheet.getCell(rowindex, col++).value = el.idBank;
                                    worksheet.getCell(rowindex, col++).value = el.bankName;
                                    worksheet.getCell(rowindex, col++).value = el.note;
                                    rowindex++;
                                })
                                for (var i = rowtitle; i < rowindex; i++) {
                                    for (var j = 1; j < col; j++) {
                                        worksheet.getCell(i, j).border = {
                                            top: { style: "thin" },
                                            left: { style: "thin" },
                                            bottom: { style: "thin" },
                                            right: { style: "thin" }
                                        };
                                        if (i === rowtitle) {
                                            worksheet.getCell(i, j).fill = {
                                                type: 'pattern',
                                                pattern: 'solid',
                                                fgColor: { argb: 'cccccc' }
                                            };
                                        }
                                    }
                                }
                                listcol.forEach(el => {

                                    worksheet.getColumn(el.code).width = el.value;
                                })


                                workbook.xlsx.writeFile(filename);
                                return res.json({ s: 0, msg: "Thành công!", filename });
                            }
                            else {
                                return res.json({ s: 1, msg: "Không có dữ liệu!", data: items });
                            }
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
        exportTemplateExcel: (req, res) => {
            try {
                if (req.user) {
                    var filename = serverData.pathFolderExport + '/customerinfo/CustomerInfoList_Temp_' + new Date().getTime() + '.xlsx';
                    var workbook = new Excel.Workbook();
                    var worksheet = workbook.addWorksheet('Danh sách  khách hàng', { properties: { tabColor: { argb: 'FFC0000' } } });
                    worksheet.getCell(2, 2).value = "DANG SÁCH KHÁCH HÀNG";

                    var rowtitle = 4;
                    var col = 1;
                    var listcol = [];
                    worksheet.getRow(rowtitle).font = { bold: true };
                    worksheet.getCell(rowtitle, col++).value = "STT";
                    listcol.push({ code: col - 1, value: 10 });
                    worksheet.getCell(rowtitle, col++).value = "Yêu cầu \n(0: Thêm; 1: Sửa; -1: Xóa)";
                    listcol.push({ code: col - 1, value: 30 });
                    worksheet.getCell(rowtitle, col++).value = "Mã hệ thống";
                    listcol.push({ code: col - 1, value: 15 });
                    worksheet.getCell(rowtitle, col++).value = "Tên khách hàng";
                    listcol.push({ code: col - 1, value: 30 });
                    worksheet.getCell(rowtitle, col++).value = "Số điện thoại";
                    listcol.push({ code: col - 1, value: 20 });
                    worksheet.getCell(rowtitle, col++).value = "Email";
                    listcol.push({ code: col - 1, value: 20 });
                    worksheet.getCell(rowtitle, col++).value = "Ngày sinh";
                    listcol.push({ code: col - 1, value: 15 });
                    worksheet.getCell(rowtitle, col++).value = "Địa chỉ";
                    listcol.push({ code: col - 1, value: 30 });
                    worksheet.getCell(rowtitle, col++).value = "CMND/CCCD";
                    listcol.push({ code: col - 1, value: 15 });
                    worksheet.getCell(rowtitle, col++).value = "Nơi cấp";
                    listcol.push({ code: col - 1, value: 30 });
                    worksheet.getCell(rowtitle, col++).value = "STK ngân hàng";
                    listcol.push({ code: col - 1, value: 15 });
                    worksheet.getCell(rowtitle, col++).value = "Ngân hàng";
                    listcol.push({ code: col - 1, value: 15 });
                    worksheet.getCell(rowtitle, col++).value = "Ghi chú";
                    listcol.push({ code: col - 1, value: 30 });


                    var rowindex = rowtitle + 1;
                    for (var i = rowindex; i < 11 + rowtitle; i++) {
                        col = 1;
                        worksheet.getCell(i, col++).value = rowindex - rowtitle;
                        worksheet.getCell(i, col++).value = "";
                        worksheet.getCell(i, col++).value = "";
                        worksheet.getCell(i, col++).value = "";
                        worksheet.getCell(i, col++).value = "";
                        worksheet.getCell(i, col++).value = "";
                        worksheet.getCell(i, col++).value = "";
                        worksheet.getCell(i, col++).value = "";
                        worksheet.getCell(i, col++).value = "";
                        worksheet.getCell(i, col++).value = "";
                        worksheet.getCell(i, col++).value = "";
                        worksheet.getCell(i, col++).value = "";
                        worksheet.getCell(i, col++).value = "";
                        rowindex++;
                    }
                    for (var i = rowtitle; i < rowindex; i++) {
                        for (var j = 1; j < col; j++) {
                            worksheet.getCell(i, j).border = {
                                top: { style: "thin" },
                                left: { style: "thin" },
                                bottom: { style: "thin" },
                                right: { style: "thin" }
                            };
                            if (i === rowtitle) {
                                worksheet.getCell(i, j).fill = {
                                    type: 'pattern',
                                    pattern: 'solid',
                                    fgColor: { argb: 'cccccc' }
                                };
                            }
                        }
                    }
                    listcol.forEach(el => {

                        worksheet.getColumn(el.code).width = el.value;
                    })



                    workbook.xlsx.writeFile(filename);
                    return res.json({ s: 0, msg: "Thành công!", filename });

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

module.exports = new CustomerInfoController();