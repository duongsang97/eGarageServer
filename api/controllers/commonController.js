"use strict";
const serverData = require("../data/serverData");

function CommonController() {
    return {
        /** @memberOf ServiceManagerController
         * @description List all building
         * @param req
         * @param res
         * @returns {Promise<any>}
         */
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
        getPayType: (req, res) => {
            try {
                if (req.user) {
                    return res.json({
                        s: 0, msg: "Thành công", data: serverData.payType,
                        listCount: serverData.payType.length
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
        getReceiptsReason: (req, res) => {
            try {
                if (req.user) {
                    return res.json({
                        s: 0, msg: "Thành công", data: serverData.receiptsReason,
                        listCount: serverData.receiptsReason.length
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
        getPayslipReason: (req, res) => {
            try {
                if (req.user) {
                    return res.json({
                        s: 0, msg: "Thành công", data: serverData.payslipReason,
                        listCount: serverData.payslipReason.length
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

module.exports = new CommonController();