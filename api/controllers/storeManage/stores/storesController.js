"use strict";
const Stores = require("../../../models/storeManage/stores/storesModel").Stores;
const ObjectId = require('mongoose').Types.ObjectId;
function  StoresController() {
  return {
    /** @memberOf StoresCateManagerController
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
                Stores.find({
                    $and: [
                        {
                            $or: [{"ofGarage":{}},{"ofGarage":null},{"ofGarage.code":garageSelected}],
                        },
                        {
                            $or:[{ "name" : { $regex: keyword}},{ "code" : { $regex: keyword}}]
                        },
                        {"recordStatus":1, "hostId":hostId}
                    ]
                }).skip((perPage * page) - perPage).limit(perPage).sort({"createdAt":-1}).exec((err, items) => {
                    Stores.countDocuments((err, count) => { // đếm để tính có bao nhiêu trang
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
    listAll:(req, res)=>{
       try{
            let hostId= req.user.hostId||req.user._id;
            let keyword =req.query.keyword||"";
            Stores.find({
                $and: [
                    {
                        $or:[{ "name" : { $regex: keyword}},{ "code" : { $regex: keyword}}]
                    },
                    {"recordStatus":1, "hostId":hostId}
                ]
            }).exec((err, items) => {
                let result =[];
                if(items){
                    items.forEach(e=>{
                        let _temp = {
                            "code": e.code,
                            "name": e.name,
                            "address": e.address||"",
                            "ofGarage" : e.ofGarage||null
                        };
                        result.push(_temp);
                    });
                }
                return res.json({ s: 0, msg: "Thành công",data:result||[] ,listCount: (result||[]).length});
            });
       }
       catch(ex){
        
       }
    },
    getOne: (req, res) => {
        try{
            if(req.user){
                let perPage = 50; // số lượng sản phẩm xuất hiện trên 1 page
                let page = req.query.page || 1; // trang
                let hostId = Stores.ObjectId(req.user.hostId||req.user._id); // lấy dữ liệu của chủ garage
                let keyword = req.query.keyword||"";
                Stores.findOne({
                    $and: [
                        {
                            $or:[{ "_id" : ObjectId.isValid(keyword)?Stores.ObjectId(keyword):null},{ "code" : keyword}]
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
                req.body.createdBy = Stores.ObjectId(req.user._id);
                req.body.updatedBy = Stores.ObjectId(req.user._id);
                req.body.hostId = Stores.ObjectId(req.user.hostId||req.user._id); // lấy dữ liệu của chủ garage
                if(!req.body.code){
                    req.body.code = await Stores.GenerateKeyCode();
                }
                Stores.create(req.body, function (err, small) {
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
            if(req.user && (req.body && req.body.hasOwnProperty("code"))){
                req.body.updatedBy = Stores.ObjectId(req.user._id);
                req.body.hostId = Stores.ObjectId(req.user.hostId||req.user._id); // lấy dữ liệu của chủ garage
                // kiểm tra nếu dữ liệu thuộc garage --> mới dc cập nhật
                return Stores.findById(req.body._id).exec().then((result)=>{
                    if(result){
                        // xác định có phải Stores cate global hay ko?
                        if((!result.ofGarage || result.ofGarage == {}) && result.hostId != req.user._id){
                            return res.json({ s: 1, msg: "Không có quyền",data:null});
                        }
                        else{
                            Stores.findByIdAndUpdate(req.body._id,req.body, function (err, small) {
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
    delete: (req, res) => {
        try{
            if(req.user){
                let perPage = 50; // số lượng sản phẩm xuất hiện trên 1 page
                let page = req.query.page || 1; // trang
                let hostId = Stores.ObjectId(req.user.hostId||req.user._id); // lấy dữ liệu của chủ garage
                let keyword = req.query.keyword||"";
                // kiểm tra nếu dữ liệu thuộc garage --> mới dc cập nhật
                Stores.findOne({
                    $and: [
                        {
                            $or:[{ "_id" : ObjectId.isValid(keyword)?Stores.ObjectId(keyword):null},{ "code" : keyword}]
                        },
                        {"recordStatus":1, "hostId":hostId}
                    ]
                }).exec().then((result)=>{
                    if(result){
                        // xác định có phải Product cate global hay ko?
                        if((!result.ofGarage || result.ofGarage == {}) && result.hostId != req.user._id){
                            return res.json({ s: 1, msg: "Không có quyền",data:null});
                        }
                        else{
                            result.recordStatus = -1;
                            Stores.findByIdAndUpdate(result._id,result, function (err, small) {
                                if (err){
                                    let errMsg =err;
                                    return res.json({ s: 1, msg: errMsg,data:null });
                                }
                                else{
                                    if(!small){
                                        return res.json({ s: 1, msg: "Không tìm thấy dữ liệu",data:null});
                                    }
                                    return res.json({ s: 0, msg: "Thành công",data:{}});
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
            res.json({ s: 1, msg: "Có lỗi xảy ra khi xử lý dữ liệu" ,data:null});
        }
    },
  };
}

module.exports = new StoresController();