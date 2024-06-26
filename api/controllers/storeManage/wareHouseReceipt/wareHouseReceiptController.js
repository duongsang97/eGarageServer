"use strict";

const e = require("cors");

const WareHouseReceipt = require("../../../models/storeManage/wareHouseReceipt/wareHouseReceiptModel").WareHouseReceipt;
const Inventory = require("../../../models/storeManage/inventory/inventoryModel").Inventory;
const ObjectId = require('mongoose').Types.ObjectId;
const Stores = require("../../../models/storeManage/stores/storesModel").Stores;

function WareHouseReceiptController() {
  return {
    /** @memberOf ServiceManagerController
     * @description List all building
     * @param req
     * @param res
     * @returns {Promise<any>}
     */
    list: async (req, res) => {
        try{
            if(req.user){
                let perPage = 50; // số lượng sản phẩm xuất hiện trên 1 page
                let page = req.params.page || 1; // trang
                let hostId= req.user.hostId||req.user._id;
                let garageSelected =req.query.garageSelected||"";
                let keyword =req.query.keyword||"";
                var listStore = await Stores.find({"ofGarage.code":garageSelected,"recordStatus":1, "hostId":hostId});
                if(listStore){
                    let keySearch = [];
                    listStore.forEach(element=>{
                        if(element.ofGarage){
                            keySearch.push({"receiptTo.code":element.code})
                        }
                    });
                    WareHouseReceipt.find({
                        $and: [
                            {
                                $or:[{ "name" : { $regex: keyword}},{ "code" : { $regex: keyword}}]
                            },
                            {
                               $or:keySearch, 
                            },
                            {"recordStatus":1, "hostId":hostId,"ofGarage.code":garageSelected}
                        ]
                    }).skip((perPage * page) - perPage).limit(perPage).sort({"createdAt":-1}).exec((err, items) => {
                        WareHouseReceipt.countDocuments((err, count) => { // đếm để tính có bao nhiêu trang
                          if (err){
                            return res.json({ s: 1, msg: "không tìm thấy dữ liệu",data:err });
                          }
                            return res.json({ s: 0, msg: "Thành công",data:items||[], listCount: (items||[]).length});
                        });
                      });
                }
                else{
                    return res.json({ s: 0, msg: "Thành công",data:[], listCount:0});
                }
            }
            else{
                res.json({ s: 1, msg: "không tìm thấy dữ liệu",data:null });
            }
        }
        catch(ex){
            res.json({ s: 1, msg: "Có lỗi xảy ra khi xử lý dữ liệu" ,data:null});
        }
    },
    getOne: async (req, res) => {
        try{
            if(req.user){
                let garageSelected =req.query.garageSelected||"";
                let perPage = 50; // số lượng sản phẩm xuất hiện trên 1 page
                let page = req.query.page || 1; // trang
                let hostId = WareHouseReceipt.ObjectId(req.user.hostId||req.user._id); // lấy dữ liệu của chủ garage
                let keyword = req.query.keyword||"";
                var listStore = await Stores.find({"ofGarage.code":garageSelected,"recordStatus":1, "hostId":hostId});
                if(listStore){
                    let keySearch = [];
                    listStore.forEach(element=>{
                        if(element.ofGarage){
                            keySearch.push({"receiptTo.code":element.code})
                        }
                    });
                    WareHouseReceipt.findOne({
                        $and: [
                            {
                                $or:[{ "_id" : ObjectId.isValid(keyword)?WareHouseReceipt.ObjectId(keyword):null},{ "code" : keyword}]
                            },
                            {
                                $or:keySearch
                            },
                            {"recordStatus":1, "hostId":hostId,"ofGarage.code":garageSelected}
                        ]
                    }).then(result=>{
                        return res.json({ s: 0, msg: "Thành công",data:result||{},listCount:(result||{}).length});
                    });
                }
                else{
                    return res.json({ s: 0, msg: "Thành công",data:[], listCount:0});
                }
                
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
                let garageSelected =req.query.garageSelected||"";
                req.body.createdBy = WareHouseReceipt.ObjectId(req.user._id);
                req.body.updatedBy = WareHouseReceipt.ObjectId(req.user._id);
                req.body.hostId = WareHouseReceipt.ObjectId(req.user.hostId||req.user._id); // lấy dữ liệu của chủ garage
                if(!req.body.code){
                    req.body.code = await WareHouseReceipt.GenerateKeyCode();
                }
                req.body.totalAmountOwed = req.body.totalMoneyNumber || 0;
                var listStore = await Stores.find({"ofGarage.code":garageSelected,"recordStatus":1, "hostId":req.body.hostId});
                let checked = false;
                if(listStore){
                    listStore.forEach(element=>{
                        if(req.body.receiptTo && element.code == req.body.receiptTo.code){
                            checked = true;
                        }
                    });
                    if(true){
                        WareHouseReceipt.create(req.body,function (err, small)  {
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
                                // cập nhật dữ liệu hàng vào tồn kho
                                if(small.receiptStatus && small.receiptStatus ==1 && small.receiptDetail){
                                    // kiểm tra và xủ lý hàng
                                    //const options = {upsert: true,new: true,setDefaultsOnInsert: true};
                                   small.receiptDetail.forEach( async (element)=> {
                                        let productReceipt ={
                                            "product":element.product,
                                            "unit":element.unit,
                                            "amount":element.actual,
                                            "hostId":req.body.hostId,
                                            "store": {"code":small.receiptTo.code,"name":small.receiptTo.name},
                                            "note":""
                                        };
                                        let query = {"product.code":productReceipt.product.code,"unit.code":productReceipt.unit.code,"store.code":small.receiptTo.code}
                                        var _temp = await Inventory.findOne(query);
                                        if(_temp){
                                            _temp.amount = Number(_temp.amount)+Number(productReceipt.amount);
                                            await Inventory.findOneAndUpdate(query,_temp);
                                        }
                                        else{
                                            await Inventory.create(productReceipt);
                                        }
                                   });
                                }
                                return res.json({ s: 0, msg: "Thành công",data:small});
                            }
                          });
                    }
                    else{
                        res.json({ s: 1, msg: "Không có quyền truy cập",data:null });
                    }
                }
                else{
                    res.json({ s: 1, msg: "Không có quyền truy cập",data:null });
                }
            }
            else{
                res.json({ s: 1, msg: "không tìm thấy dữ liệu",data:null });
            }
        }
        catch(ex){
            res.json({ s: 1, msg: "Có lỗi xảy ra khi xử lý dữ liệu" ,data:ex});
        }
    },
    update: async (req, res) => {
        try{
            if(req.user && (req.body)){
                let garageSelected =req.query.garageSelected||"";
                req.body.updatedBy = WareHouseReceipt.ObjectId(req.user._id);
                req.body.hostId = WareHouseReceipt.ObjectId(req.user.hostId||req.user._id); // lấy dữ liệu của chủ garage
                
                //Thịnh thêm
                delete req.body.totalAmountOwed; // K cho phép cập nhật field này

                // kiểm tra nếu dữ liệu thuộc garage --> mới dc cập nhật
                var listStore = await Stores.find({"ofGarage.code":garageSelected,"recordStatus":1, "hostId":req.body.hostId});
                let checked = false;
                if(listStore){
                    listStore.forEach(element=>{
                        if(req.body.receiptTo && element.code == req.body.receiptTo.code){
                            checked = true;
                        }
                    });

                    if(checked){
                        WareHouseReceipt.findByIdAndUpdate(req.body._id,req.body, function (err, small) {
                            if (err){
                                let errMsg =err;
                                return res.json({ s: 1, msg: errMsg,data:null });
                            }
                            else{
                                if(!small){
                                    return res.json({ s: 1, msg: "Không tìm thấy dữ liệu",data:null});
                                }
                                // cập nhật dữ liệu hàng vào tồn kho
                                if(req.body.receiptStatus && req.body.receiptStatus ==1 && req.body.receiptDetail){
                                    // kiểm tra và xủ lý hàng
                                    //const options = {upsert: true,new: true,setDefaultsOnInsert: true};
                                    req.body.receiptDetail.forEach( async (element)=> {
                                        let productReceipt ={
                                            "product":element.product,
                                            "unit":element.unit,
                                            "amount":element.actual,
                                            "hostId":req.body.hostId,
                                            "store": {"code":req.body.receiptTo.code,"name":req.body.receiptTo.name},
                                            "note":""
                                        };
                                        let query = {"product.code":productReceipt.product.code,"unit.code":productReceipt.unit.code,"store.code":req.body.receiptTo.code}
                                        var _temp = await Inventory.findOne(query);
                                        if(_temp){
                                            _temp.amount = Number(_temp.amount)+Number(productReceipt.amount);
                                            await Inventory.findOneAndUpdate(query,_temp);
                                        }
                                        else{
                                            await Inventory.create(productReceipt);
                                        }
                                });
                                }
                                return res.json({ s: 0, msg: "Thành công",data:req.body});
                            }
                          });
                    }
                    else{
                        res.json({ s: 1, msg: "Không có quyền truy cập",data:null });
                    }
                }
                else{
                    res.json({ s: 1, msg: "Không có quyền truy cập",data:null });
                }
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

module.exports = new WareHouseReceiptController();