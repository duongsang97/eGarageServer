"use strict";

const e = require("cors");

const WareHouseExport = require("../../../models/storeManage/wareHouseExport/wareHouseExportModel").WareHouseExport;
const WareHouseReceipt = require("../../../models/storeManage/wareHouseReceipt/wareHouseReceiptModel").WareHouseReceipt;
const ObjectId = require('mongoose').Types.ObjectId;
const Inventory = require("../../../models/storeManage/inventory/inventoryModel").Inventory;
const Stores = require("../../../models/storeManage/stores/storesModel").Stores;
const dateFormat = require('date-format');
function WareHouseExportController() {
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
                            keySearch.push({"exportFrom.code":element.code})
                        }
                    });
                    WareHouseExport.find({
                        $and: [
                            {
                                $or:[{ "name" : { $regex: keyword}},{ "code" : { $regex: keyword}}]
                            },
                            {
                                $or:keySearch
                            },
                            {"recordStatus":1, "hostId":hostId}
                        ]
                    }).skip((perPage * page) - perPage).limit(perPage).sort({"createdAt":-1}).exec((err, items) => {
                        WareHouseExport.countDocuments((err, count) => { // đếm để tính có bao nhiêu trang
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
                let hostId = WareHouseExport.ObjectId(req.user.hostId||req.user._id); // lấy dữ liệu của chủ garage
                let keyword = req.query.keyword||"";
                var listStore = await Stores.find({"ofGarage.code":garageSelected,"recordStatus":1, "hostId":hostId});
                if(listStore){
                    let keySearch = [];
                    listStore.forEach(element=>{
                        if(element.ofGarage){
                            keySearch.push({"exportFrom.code":element.code})
                        }
                    });
                    WareHouseExport.findOne({
                        $and: [
                            {
                                $or:[{ "_id" : ObjectId.isValid(keyword)?WareHouseExport.ObjectId(keyword):null},{ "code" : keyword}]
                            },
                            {
                                $or:keySearch
                            },
                            {"recordStatus":1, "hostId":hostId}
                        ]
                    }).then(result=>{
                        return res.json({ s: 0, msg: "Thành công",data:result||{},listCount:(result||{}).length});
                    });
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
                req.body.createdBy = WareHouseExport.ObjectId(req.user._id);
                req.body.updatedBy = WareHouseExport.ObjectId(req.user._id);
                req.body.hostId = WareHouseExport.ObjectId(req.user.hostId||req.user._id); // lấy dữ liệu của chủ garage
                if(!req.body.code){
                    req.body.code = await WareHouseExport.GenerateKeyCode();
                }
                var listStore = await Stores.find({"ofGarage.code":garageSelected,"recordStatus":1, "hostId":req.body.hostId});
                let checked = false;
                if(listStore){
                    listStore.forEach(element=>{
                        if(req.body.exportFrom && element.code == req.body.exportFrom.code){
                            checked = true;
                        }
                    });
                    if(checked){
                        WareHouseExport.create(req.body, async function (err, small) {
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
                            let receiptDetailData = [];
                            // cập nhật dữ liệu hàng vào tồn kho
                            if(small.exportStatus && small.exportStatus ==1 && small.exportDetail){
                                // kiểm tra và xủ lý hàng
                                //const options = {upsert: true,new: true,setDefaultsOnInsert: true};
                                small.exportDetail.forEach( async (element)=> {
                                    let productExport ={
                                        "product":element.product,
                                        "unit":element.unit,
                                        "amount":element.actual,
                                        "hostId":req.body.hostId,
                                        "store": {"code":small.exportFrom.code,"name":small.exportFrom.name},
                                        "note":""
                                    };
                                    let receiptDetailTemp ={
                                        "product":element.product,
                                        "unit":element.unit,
                                        "voucherActual": element.requestActual,
                                        "actual":element.actual,
                                        "unitPrice":element.unitPrice,
                                        "amount": element.amount
                                    }
                                    receiptDetailData.push(receiptDetailTemp);

                                    let query = {"product.code":productExport.product.code,"unit.code":productExport.unit.code,"store.code":small.exportFrom.code}
                                    var _temp = await Inventory.findOne(query);
                                    if(_temp){
                                        _temp.amount = Number(_temp.amount)-Number(productExport.amount);
                                        if(_temp.amount < 0){
                                            _temp.amount = 0;
                                        }
                                        await Inventory.findOneAndUpdate(query,_temp);
                                    }
                                    else{
                                        await Inventory.create(productExport);
                                    }
                                });

                                // kiểm tra nếu xuất kho nội bộ --> tự động tạo phiếu nhập cho kho đến
                                if(req.body.exportTo && req.body.exportTo.code){
                                    var _tempData ={
                                        code: await WareHouseReceipt.GenerateKeyCode(),
                                        receiptStatus: 0,
                                        supplierObject:{"code":"noibo","name":"Nhập|xuất nội bộ"},
                                        info:"",
                                        receiptTo: req.body.exportTo,
                                        receiptFrom: req.body.exportFrom,
                                        totalMoneyNumber:req.body.totalMoneyNumber,
                                        totalMoneyString:req.body.totalMoneyString,
                                        voucherNumber: "NNB_"+dateFormat('yyyyMMddhhmmss', new Date()),
                                        receiptDetail:receiptDetailData||[],
                                        hostId:req.body.hostId,
                                        createdBy:req.body.createdBy,
                                        updatedBy:req.body.update,
                                        note:""
                                    };
                                    await WareHouseReceipt.create(_tempData);
                                }
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
                res.json({ s: 1, msg: "không tìm thấy thông tin tài khoản",data:null });
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
                req.body.updatedBy = WareHouseExport.ObjectId(req.user._id);
                req.body.hostId = WareHouseExport.ObjectId(req.user.hostId||req.user._id); // lấy dữ liệu của chủ garage
                var listGare = await Stores.find({"ofGarage.code":garageSelected,"recordStatus":1, "hostId":req.body.hostId});
                let checked = false;
                if(listGare){
                    listGare.forEach(element=>{
                        if(req.body.exportFrom && element.code == req.body.exportFrom.code){
                            checked = true;
                        }
                    });
                    if(checked){
                        WareHouseExport.findByIdAndUpdate(req.body._id,req.body, function (err, small) {
                            if (err){
                                let errMsg =err;
                                return res.json({ s: 1, msg: errMsg,data:null });
                            }
                            else{
                                if(!small){
                                    return res.json({ s: 1, msg: "Không tìm thấy dữ liệu",data:null});
                                }
                                // cập nhật dữ liệu hàng vào tồn kho
                                else{
                                    if(req.body.exportStatus && req.body.exportStatus ==1 && req.body.exportDetail){
                                        // kiểm tra và xủ lý hàng
                                        //const options = {upsert: true,new: true,setDefaultsOnInsert: true};
                                        req.body.exportDetail.forEach( async (element)=> {
                                            let productExport ={
                                                "product":element.product,
                                                "unit":element.unit,
                                                "amount":element.actual,
                                                "hostId":req.body.hostId,
                                                "store": {"code":req.body.exportFrom.code,"name":req.body.exportFrom.name},
                                                "note":""
                                            };
                                            let query = {"product.code":productExport.product.code,"unit.code":productExport.unit.code,"store.code":req.body.exportFrom.code}
                                            var _temp = await Inventory.findOne(query);
                                            if(_temp){
                                                _temp.amount = Number(_temp.amount)-Number(productExport.amount);
                                                if(_temp.amount < 0){
                                                    _temp.amount = 0;
                                                }
                                                await Inventory.findOneAndUpdate(query,_temp);
                                            }
                                            else{
                                                await Inventory.create(productExport);
                                            }
                                        });
                                    }
                                    return res.json({ s: 0, msg: "Thành công",data:small});
                                }
                            }
                        });
                    }
                    else{
                        res.json({ s: 1, msg: "không có quyền truy cập",data:null });
                    }
                }
                else{
                    res.json({ s: 1, msg: "không có quyền truy cập",data:null });
                }
            }
            else{
                res.json({ s: 1, msg: "không tìm thấy thông tin tài khoản",data:null });
            }
        }
        catch(ex){
            res.json({ s: 1, msg: "Có lỗi xảy ra khi xử lý dữ liệu" ,data:ex});
        }
    },
  };
}

module.exports = new WareHouseExportController();