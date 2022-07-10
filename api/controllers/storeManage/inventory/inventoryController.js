"use strict";
const Inventory = require("../../../models/storeManage/inventory/inventoryModel").Inventory;
const ObjectId = require('mongoose').Types.ObjectId;
const Stores = require("../../../models/storeManage/stores/storesModel").Stores;

function  InventoryController() {
  return {
    /** @memberOf InventoryManagerController
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
                            keySearch.push({"store.code":element.code})
                        }
                    });
                    Inventory.find({
                        $and: [
                            {
                                $or:[{ "name" : { $regex: keyword}},{ "code" : { $regex: keyword}}]
                            },
                            {
                                $or:keySearch
                            },
                            {"recordStatus":1, "hostId":hostId,}
                        ]
                    }).skip((perPage * page) - perPage).limit(perPage).sort({"createdAt":-1}).exec((err, items) => {
                        Inventory.countDocuments((err, count) => { // đếm để tính có bao nhiêu trang
                          if (err){
                            return res.json({ s: 1, msg: "không tìm thấy dữ liệu",data:err });
                          }
                            return res.json({ s: 0, msg: "Thành công",data:items||[] ,listCount: (items||[]).length});
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
            console.log(ex);
            res.json({ s: 1, msg: "Có lỗi xảy ra khi xử lý dữ liệu" ,data:null});
        }
    },
    // getOne: (req, res) => {
    //     try{
    //         if(req.user){
    //             let perPage = 50; // số lượng sản phẩm xuất hiện trên 1 page
    //             let page = req.query.page || 1; // trang
    //             let hostId = Inventory.ObjectId(req.user.hostId||req.user._id); // lấy dữ liệu của chủ garage
    //             let garageSelected =req.query.garageSelected||"";
    //             let keyword = req.query.keyword||"";
    //             Inventory.findOne({
    //                 $and: [
    //                     {
    //                         $or:[{ "_id" : ObjectId.isValid(keyword)?Inventory.ObjectId(keyword):null},{ "code" : keyword}]
    //                     },
    //                     {"recordStatus":1, "hostId":hostId,}
    //                 ]
    //             }).then(result=>{
    //                 return res.json({ s: 0, msg: "Thành công",data:result||{},listCount:(result||{}).length});
    //             });
    //         }
    //         else{
    //             res.json({ s: 1, msg: "không tìm thấy dữ liệu",data:null });
    //         }
    //     }
    //     catch(ex){
    //         res.json({ s: 1, msg: "Có lỗi xảy ra khi xử lý dữ liệu" ,data:null});
    //     }
    // },
    getOverview: (req, res) => {
        try{
            if(req.user){
                let perPage = 50; // số lượng sản phẩm xuất hiện trên 1 page
                let page = req.params.page || 1; // trang
                let hostId= req.user.hostId||req.user._id;
                let garageSelected =req.query.garageSelected||"";
                let keyword =req.query.keyword||"";
                let items = [
                    {
                        code:"overview_1",
                        name:"Sản phẩm sắp hết",
                        values: 10
                    },
                    {
                        code:"overview_2",
                        name:"Phiếu nhập chờ xử lý",
                        values: 5
                    },
                    {
                        code:"overview_3",
                        name:"Phiếu xuất chờ xử lý",
                        values: 17
                    },
                    {
                        code:"overview_4",
                        name:"Tổng giá trị hàng",
                        values: "100.000.000"
                    },
                    {
                        code:"overview_5",
                        name:"Tổng hàng trong kho",
                        values: "10"
                    }
                ];
                return res.json({ s: 0, msg: "Thành công",data:items||[] ,listCount: (items||[]).length});
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
  };
}

module.exports = new InventoryController();