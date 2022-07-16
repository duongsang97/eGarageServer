"use strict";
const Units = require("../../../models/storeManage/units/unitsModel").Units;
const AppData = require("../../../data/serverData");
const ObjectId = require('mongoose').Types.ObjectId;
function  SupplierController() {
  return {
    /** @memberOf SupplierCateManagerController
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
                let keyword =req.query.keyword||"";
                Units.find({
                    $and: [
                        {
                            $or:[{ "name" : { $regex: keyword}},{ "code" : { $regex: keyword}}]
                        },
                        {"recordStatus":1, "hostId":hostId}
                    ]
                }).skip((perPage * page) - perPage).limit(perPage).exec((err, items) => {
                    Units.countDocuments((err, count) => { // đếm để tính có bao nhiêu trang
                      if (err){
                        return res.json({ s: 1, msg: "không tìm thấy dữ liệu",data:err });
                      }
                        return res.json({ s: 0, msg: "Thành công",data:items||[] ,listCount: (items||[]).length});
                    });
                  });
            }
            else{
                res.json({ s: 1, msg: "không tìm thấy dữ liệu",data:null });
            }
        }
        catch(ex){
            console.log(ex);
            res.json({ s: 1, msg: "Có lỗi xảy ra khi xử lý dữ liệu" ,data:null});
        }
    },
    getOne: (req, res) => {
        try{
            if(req.user){
                let perPage = 50; // số lượng sản phẩm xuất hiện trên 1 page
                let page = req.query.page || 1; // trang
                let hostId = Units.ObjectId(req.user.hostId||req.user._id); // lấy dữ liệu của chủ garage
                let keyword = req.query.keyword||"";
                Units.findOne({
                    $and: [
                        {
                            $or:[{ "_id" : ObjectId.isValid(keyword)?Units.ObjectId(keyword):null},{ "code" : keyword}]
                        },
                        {"recordStatus":1, "hostId":hostId}
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
            if(req.user && (req.body)){
                req.body.createdBy = Units.ObjectId(req.user._id);
                req.body.updatedBy = Units.ObjectId(req.user._id);
                req.body.hostId = Units.ObjectId(req.user.hostId||req.user._id); // lấy dữ liệu của chủ garage
                if(!req.body.code){
                    req.body.code = await Units.GenerateKeyCode();
                }
                Units.create(req.body, function (err, small) {
                    if (err){
                        let errMsg ="";
                        if(err.code === 11000){
                            errMsg="Trùng mã hoặc tên";
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
            if(req.user && (req.body && req.body.hasOwnProperty("code"))){
                req.body.updatedBy = Units.ObjectId(req.user._id);
                req.body.hostId = Units.ObjectId(req.user.hostId||req.user._id); // lấy dữ liệu của chủ garage
                // kiểm tra nếu dữ liệu thuộc garage --> mới dc cập nhật
                Units.findByIdAndUpdate(req.body._id,req.body, function (err, small) {
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

module.exports = new SupplierController();