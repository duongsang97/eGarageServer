"use strict";
const Automaker = require("../../models/automakers/autoMakerModel").Automaker;
const ObjectId = require('mongoose').Types.ObjectId;
function AutomakerController() {
  return {
    /** @memberOf AutomakerManagerController
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
                Automaker.aggregate([
                    {
                        $match:{
                            $and: [
                                {
                                    $or:[{ "name" : { $regex: keyword}},{ "code" : { $regex: keyword}}]
                                },
                                {"recordStatus":1, "hostId": Automaker.ObjectId(hostId)}
                            ]
                        }
                    },
                    {
                        $lookup:{
                            from: "g_carcates", // collection name in db
                            localField: "code",
                            foreignField: "autoMarket.code",
                            as: "carCates"
                        }
                    },
                ]).skip((perPage * page) - perPage).limit(perPage).exec((err, items) => {
                    Automaker.countDocuments((err, count) => { // đếm để tính có bao nhiêu trang
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
                let hostId = Automaker.ObjectId(req.user.hostId||req.user._id); // lấy dữ liệu của chủ garage
                let keyword = req.query.keyword||"";
                let keySearch= [{ "_id" : Automaker.ObjectId(keyword)},{ "code" : keyword}];
                Automaker.aggregate([
                    {
                        $match:{
                            $and: [
                                {
                                    $or:keySearch
                                },
                                {"recordStatus":1, "hostId": Automaker.ObjectId(hostId)}
                            ]
                        }
                    },
                    {
                        $lookup:{
                            from: "g_carcates", // collection name in db
                            localField: "code",
                            foreignField: "autoMarket.code",
                            as: "carCates"
                        }
                    },
                ]).exec((err, items) => {
                    Automaker.countDocuments((err, count) => { // đếm để tính có bao nhiêu trang
                      if (err){
                        return res.json({ s: 1, msg: "không tìm thấy dữ liệu",data:err });
                      }
                        return res.json({ s: 0, msg: "Thành công",data:items||{} ,listCount: 1});
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
    create: async (req, res) => {
        try{
            let data = JSON.parse((req.body.data)||{});
            let logos = (req.files &&  req.files.logo)?req.files.logo:null;
            if(req.user && data){
                data.createdBy = Automaker.ObjectId(req.user._id);
                data.hostId = Automaker.ObjectId(req.user.hostId||req.user._id); // lấy dữ liệu của chủ garage
                if(!data.code){
                    data.code = await Automaker.GenerateKeyCode();
                }
                // xử lý hình ảnh tải lên
                try{
                    // xử lý hình ảnh garage
                    // xử lý logo
                    if(logos){
                        data.logo = logos[0].path;
                    }
                }
                catch(ex){
                    console.log(ex);
                }

                Automaker.create(data, function (err, small) {
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
            let data = JSON.parse((req.body.data)||{});
            let logos = (req.files &&  req.files.logo)?req.files.logo:null;
            if(req.user && data){
                data.updatedBy = Automaker.ObjectId(req.user._id);
                 // xử lý hình ảnh tải lên
                 try{
                    // xử lý logo
                    if(logos){
                        data.logo = logos[0].path;
                    }
                }
                catch(ex){
                    console.log(ex);
                }
                //delete req.body[createdBy]; // xóa ko cho cập nhật tránh lỗi mất dữ liệu người dùng
                Automaker.findByIdAndUpdate(data._id, data, function (err, doc,re) {
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
            console.log(ex);
            res.json({ s: 1, msg: "Có lỗi xảy ra khi xử lý dữ liệu" ,data:ex});
        }
    },
  };
}

module.exports = new AutomakerController();