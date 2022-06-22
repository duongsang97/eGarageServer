"use strict";
const Garage = require("../../models/garages/garageModel").Garage;
const ObjectId = require('mongoose').Types.ObjectId;
function ProfileController() {
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
                let page = req.query.page || 1; // trang
                let hostId = Garage.ObjectId(req.user.hostId||req.user._id); // lấy dữ liệu của chủ garage
                Garage.find({
                    $and: [
                        {"recordStatus":1, "hostId":hostId}
                    ]
                }).skip((perPage * page) - perPage).limit(perPage).exec((err, items) => {
                    Garage.countDocuments((err, count) => { // đếm để tính có bao nhiêu trang
                      if (err){
                        return res.json({ s: 1, msg: "không tìm thấy dữ liệu",data:err });
                      }
                        return res.json({ s: 0, msg: "Thành công",data:items||[],listCount:(items||[]).length});
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
                let perPage = 50; // số lượng sản phẩm xuất hiện trên 1 page
                let page = req.query.page || 1; // trang
                let hostId = Garage.ObjectId(req.user.hostId||req.user._id); // lấy dữ liệu của chủ garage
                let keyword = req.query.keyword||"";
                Garage.findOne({
                    $and: [
                        {
                            $or:[{ "_id" : ObjectId.isValid(keyword)?Garage.ObjectId(keyword):null},{ "code" : keyword}]
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
            console.log(ex);
            res.json({ s: 1, msg: "Có lỗi xảy ra khi xử lý dữ liệu" ,data:null});
        }
    },
    create: async (req, res) => {
        try{
            if(req.user && req.body){
                req.body.createdBy = Garage.ObjectId(req.user._id);
                req.body.hostId = Garage.ObjectId(req.user.hostId||req.user._id); // lấy dữ liệu của chủ garage
                if(!req.body.code){
                    req.body.code = await Garage.GenerateKeyCode();
                }
                Garage.create(req.body, function (err, small) {
                    if (err){
                        return res.json({ s: 1, msg: err,data:null });
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
            if(req.user && req.body){
                req.body.updatedBy = Garage.ObjectId(req.user._id);
                //delete req.body[createdBy]; // xóa ko cho cập nhật tránh lỗi mất dữ liệu người dùng
                Garage.findByIdAndUpdate(req.body._id, req.body, function (err, doc,re) {
                    if (err){
                        return res.json({ s: 1, msg: "Thất bại",data:err });
                    }
                    else{
                        return res.json({ s: 0, msg: "Thành công",data:re});
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

module.exports = new ProfileController();