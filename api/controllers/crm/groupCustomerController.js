"use strict";
const GroupCustomer = require("../../models/crm/groupCustomerModel").GroupCustomer;
var Excel = require('exceljs');
var formidable = require('formidable');
const serverData = require("../../data/serverData");
const fs = require('fs');

function GroupCustomerController() {
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
                    let hostId = req.user.hostId !== '' ? req.user.hostId : req.user._id.toString();
                    let perPage = req.params.perPage || 0; // số lượng sản phẩm xuất hiện trên 1 page
                    let page = req.params.page || 0; // trang
                    if (perPage === 0 || page === 0) {
                        GroupCustomer.find({
                            $and: [
                                { "recordStatus": 1 },
                                { "hostId": hostId },
                            ]
                        }).exec((err, items) => {
                            GroupCustomer.countDocuments((err, count) => { // đếm để tính có bao nhiêu trang
                                if (err) {
                                    return res.json({ s: 1, msg: "không tìm thấy dữ liệu", data: err });
                                }
                                return res.json({ s: 0, msg: "Thành công", data: items });
                            });
                        });
                    }
                    else {
                        GroupCustomer.find({
                            $and: [
                                { "recordStatus": 1 },
                                { "hostId": hostId },
                            ]
                        }).skip((perPage * page) - perPage).limit(perPage).exec((err, items) => {
                            GroupCustomer.countDocuments((err, count) => { // đếm để tính có bao nhiêu trang
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
        create: (req, res) => {
            try {
                if (req.user && req.body) {
                    let hostId = req.user.hostId !== '' ? req.user.hostId : req.user._id.toString();
                    req.body.createdBy = GroupCustomer.ObjectId(req.user._id);
                    req.body.createdDate = Date.now();
                    req.body.hostId = hostId;
                    GroupCustomer.create(req.body, function (err, small) {
                        if (err) {
                            return res.json({ s: 1, msg: err, data: null });
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
                    req.body.updatedBy = GroupCustomer.ObjectId(req.user._id);
                    //delete req.body[createdBy]; // xóa ko cho cập nhật tránh lỗi mất dữ liệu người dùng
                    GroupCustomer.findByIdAndUpdate(req.body._id, req.body, function (err, doc, re) {
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
                    req.body.updatedBy = GroupCustomer.ObjectId(req.user._id);
                    //delete req.body[createdBy]; // xóa ko cho cập nhật tránh lỗi mất dữ liệu người dùng
                    GroupCustomer.findById(req.body._id, function (err, doc) {
                        if (err) {
                            return res.json({ s: 1, msg: "Thất bại", data: err });
                        }
                        else {
                            doc.recordStatus = 0;
                            GroupCustomer.findByIdAndUpdate(req.body._id, doc, function (err, doc, re) {
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
                    let hostId = req.user.hostId !== '' ? req.user.hostId : req.user._id.toString();
                    GroupCustomer.find({
                        $and: [
                            { "recordStatus": 1 },
                            { "hostId": hostId },
                        ]
                    }).exec((err, items) => {
                        GroupCustomer.countDocuments((err, count) => { // đếm để tính có bao nhiêu trang
                            if (err) {
                                return res.json({ s: 1, msg: "không tìm thấy dữ liệu", data: err });
                            }
                            if (count > 0) {
                                var filename = serverData.pathExceltmp + '/groupcustomer/GroupCustomerList_' + new Date().getTime() + '.xlsx';
                                var workbook = new Excel.Workbook();
                                var worksheet = workbook.addWorksheet('Nhóm Kh', { properties: { tabColor: { argb: 'FFC0000' } } });
                                worksheet.getCell(2, 2).value = "Danh sách nhóm khách hàng";

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
                                worksheet.getCell(rowtitle, col++).value = "Tên nhóm KH";
                                listcol.push({ code: col - 1, value: 30 });
                                worksheet.getCell(rowtitle, col++).value = "Mốc điểm";
                                listcol.push({ code: col - 1, value: 15 });
                                worksheet.getCell(rowtitle, col++).value = "Chiết khấu (%)";
                                listcol.push({ code: col - 1, value: 15 });
                                worksheet.getCell(rowtitle, col++).value = "Ghi chú";
                                listcol.push({ code: col - 1, value: 50 });

                                var rowindex = rowtitle + 1;
                                items.forEach(function (el, index) {
                                    col = 1;
                                    worksheet.getCell(rowindex, col++).value = index + 1;
                                    worksheet.getCell(rowindex, col++).value = "";
                                    worksheet.getCell(rowindex, col++).value = GroupCustomer.ObjectId(el._id);
                                    worksheet.getCell(rowindex, col++).value = el.name;
                                    worksheet.getCell(rowindex, col++).value = el.target;
                                    worksheet.getCell(rowindex, col++).value = el.code;
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
                    var filename = serverData.pathExceltmp + '/groupcustomer/GroupCustomerList_Temp_' + new Date().getTime() + '.xlsx';
                    var workbook = new Excel.Workbook();
                    var worksheet = workbook.addWorksheet('Nhóm Kh', { properties: { tabColor: { argb: 'FFC0000' } } });
                    worksheet.getCell(2, 2).value = "Danh sách nhóm khách hàng";

                    var listcol = [];
                    var rowtitle = 4;
                    var col = 1;
                    worksheet.getRow(rowtitle).font = { bold: true };
                    worksheet.getCell(rowtitle, col++).value = "STT";
                    listcol.push({ code: col - 1, value: 10 });
                    worksheet.getCell(rowtitle, col++).value = "Yêu cầu \n(0: Thêm; 1: Sửa; -1: Xóa)";
                    listcol.push({ code: col - 1, value: 30 });
                    worksheet.getCell(rowtitle, col++).value = "Mã hệ thống";
                    listcol.push({ code: col - 1, value: 15 });
                    worksheet.getCell(rowtitle, col++).value = "Tên nhóm KH";
                    listcol.push({ code: col - 1, value: 30 });
                    worksheet.getCell(rowtitle, col++).value = "Mốc điểm";
                    listcol.push({ code: col - 1, value: 15 });
                    worksheet.getCell(rowtitle, col++).value = "Chiết khấu (%)";
                    listcol.push({ code: col - 1, value: 15 });
                    worksheet.getCell(rowtitle, col++).value = "Ghi chú";
                    listcol.push({ code: col - 1, value: 50 });

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

        importExcel: (req, res) => {
            try {
                if (req.user) {
                    var form = new formidable.IncomingForm();
                    form.parse(req, function (err, fields, files) {
                        console.log(files)
                        var oldpath = files.file.filepath;
                        var newpath = serverData.pathExceltmp + '/upload/' + new Date().getTime() + '_'+ files.file.originalFilename;
                        fs.copyFile(oldpath, newpath, function (err) {
                            if (err) {
                                res.json({ s: 1, msg:err, data: null });
                            }
                            else{
                                res.json({ s: 0, msg: "Thành công!", data: null });
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
    };
}

module.exports = new GroupCustomerController();