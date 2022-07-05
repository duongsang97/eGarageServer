"use strict";
const WareHouseExport = require("../../../models/storeManage/wareHouseExport/wareHouseExportModel").WareHouseExport;
const ObjectId = require('mongoose').Types.ObjectId;
function WareHouseExportController() {
  return {
    /** @memberOf ServiceManagerController
     * @description List all building
     * @param req
     * @param res
     * @returns {Promise<any>}
     */
    list: (req, res) => {
        try{
            if(req.user){
                let perPage = 50; // số lượng sản phẩm xuất hiện trên 1 page
                let page = req.params.page || 1; // trang
                let hostId= req.user.hostId||req.user._id;
                let garageSelected =req.query.garageSelected||"";
                let keyword =req.query.keyword||"";
                WareHouseExport.find({
                    $and: [
                        {
                            $or:[{ "name" : { $regex: keyword}},{ "code" : { $regex: keyword}}]
                        },
                        {"recordStatus":1, "hostId":hostId,"ofGarage.code":garageSelected}
                    ]
                }).skip((perPage * page) - perPage).limit(perPage).exec((err, items) => {
                    WareHouseExport.countDocuments((err, count) => { // đếm để tính có bao nhiêu trang
                      if (err){
                        return res.json({ s: 1, msg: "không tìm thấy dữ liệu",data:err });
                      }
                        return res.json({ s: 0, msg: "Thành công",data:items||[], listCount: (items||[]).length});
                    });
                  });
            }
            else{
                res.json({ s: 1, msg: "không tìm thấy dữ liệu",data:null });
            }
        }
        catch(ex){
            res.json({ s: 1, msg: "Có lỗi xảy ra khi xử lý dữ liệu" ,data:null});
        }
    },
    getOne: (req, res) => {
        try{
            if(req.user){
                let garageSelected =req.query.garageSelected||"";
                let perPage = 50; // số lượng sản phẩm xuất hiện trên 1 page
                let page = req.query.page || 1; // trang
                let hostId = WareHouseExport.ObjectId(req.user.hostId||req.user._id); // lấy dữ liệu của chủ garage
                let keyword = req.query.keyword||"";
                WareHouseExport.findOne({
                    $and: [
                        {
                            $or:[{ "_id" : ObjectId.isValid(keyword)?WareHouseExport.ObjectId(keyword):null},{ "code" : keyword}]
                        },
                        {"recordStatus":1, "hostId":hostId,"ofGarage.code":garageSelected}
                    ]
                }).then(result=>{
                    return res.json({ s: 0, msg: "Thành công",data:result||{},listCount:(result||{}).length});
                });
            }
            else{
                res.json({ s: 1, msg: "không tìm thấy dữ liệu",data:null });
            }
        }
        catch(ex){
            res.json({ s: 1, msg: "Có lỗi xảy ra khi xử lý dữ liệu" ,data:null});
        }
    },
    create: async (req, res) => {
        try{
            if(req.user){
                req.body.createdBy = WareHouseExport.ObjectId(req.user._id);
                req.body.updatedBy = WareHouseExport.ObjectId(req.user._id);
                req.body.hostId = WareHouseExport.ObjectId(req.user.hostId||req.user._id); // lấy dữ liệu của chủ garage
                if(!req.body.code){
                    req.body.code = await WareHouseExport.GenerateKeyCode();
                }
                WareHouseExport.create(req.body, function (err, small) {
                    if (err){
                        let errMsg ="";
                        if(err.code === 11000){
                            errMsg="Trùng mã";
                        }
                        else{
                            errMsg=err;
                        }
                        return res.json({ s: 1, msg: errMsg,data:null });
                    }
                    else{
                        return res.json({ s: 0, msg: "Thành công",data:small});
                    }
                  });
            }
            else{
                res.json({ s: 1, msg: "không tìm thấy dữ liệu",data:null });
            }
        }
        catch(ex){
            res.json({ s: 1, msg: "Có lỗi xảy ra khi xử lý dữ liệu" ,data:ex});
        }
    },
    update: (req, res) => {
        try{
            if(req.user && (req.body)){
                req.body.updatedBy = WareHouseExport.ObjectId(req.user._id);
                req.body.ofHost = WareHouseExport.ObjectId(req.user.hostId||req.user._id); // lấy dữ liệu của chủ garage
                // kiểm tra nếu dữ liệu thuộc garage --> mới dc cập nhật
                return WareHouseExport.findById(req.body._id).exec().then((result)=>{
                    if(result){
                        // xác định có phải service cate global hay ko?
                        if((!result.ofGarage || result.ofGarage == {}) && result.hostId != req.user._id){
                            return res.json({ s: 1, msg: "Không có quyền",data:null});
                        }
                        else{
                            WareHouseExport.findByIdAndUpdate(req.body._id,req.body, function (err, small) {
                                if (err){
                                    let errMsg =err;
                                    return res.json({ s: 1, msg: errMsg,data:null });
                                }
                                else{
                                    if(!small){
                                        return res.json({ s: 1, msg: "Không tìm thấy dữ liệu",data:null});
                                    }
                                    return res.json({ s: 0, msg: "Thành công",data:small});
                                }
                              });
                        }
                    }
                    else{
                        return res.json({ s: 1, msg: "Không tìm thấy dữ liệu",data:null});
                    }
                });
            }
            else{
                res.json({ s: 1, msg: "không tìm thấy dữ liệu",data:null });
            }
        }
        catch(ex){
            res.json({ s: 1, msg: "Có lỗi xảy ra khi xử lý dữ liệu" ,data:ex});
        }
    },
  };
}

module.exports = new WareHouseExportController();