"use strict";
const Ticket = require("../../models/tickets/ticketModel").Ticket;
const Garage = require("../../models/garages/garageModel").Garage;
const ObjectId = require('mongoose').Types.ObjectId;
const dateFormat = require('date-format');
function TicketController() {
  return {
    /** @memberOf TicketManagerController
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
                Ticket.aggregate([
                    {
                        $match:{
                            $and: [
                                {
                                    $or:[{ "name" : { $regex: keyword}},{ "code" : { $regex: keyword}}]
                                },
                                {"recordStatus":1, "hostId": Ticket.ObjectId(hostId)}
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
                    Ticket.countDocuments((err, count) => { // đếm để tính có bao nhiêu trang
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
                let hostId = Ticket.ObjectId(req.user.hostId||req.user._id); // lấy dữ liệu của chủ garage
                let keyword = req.query.keyword||"";
                let keySearch= [{ "_id" : Ticket.ObjectId(keyword)},{ "code" : keyword}];
                Ticket.aggregate([
                    {
                        $match:{
                            $and: [
                                {
                                    $or:keySearch
                                },
                                {"recordStatus":1, "hostId": Ticket.ObjectId(hostId)}
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
                    Ticket.countDocuments((err, count) => { // đếm để tính có bao nhiêu trang
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
                data.createdBy = Ticket.ObjectId(req.user._id);
                data.hostId = Ticket.ObjectId(req.user.hostId||req.user._id); // lấy dữ liệu của chủ garage
                if(!data.code){
                    data.code = await Ticket.GenerateKeyCode();
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

                Ticket.create(data, function (err, small) {
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
                data.updatedBy = Ticket.ObjectId(req.user._id);
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
                Ticket.findByIdAndUpdate(data._id, data, function (err, doc,re) {
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

    booking: async (req, res)=>{
        try{
            if(req.user && (req.body)){
                req.body.createdBy = Ticket.ObjectId(req.user._id);
                req.body.updatedBy = Ticket.ObjectId(req.user._id);
                req.body.hostId = Ticket.ObjectId(req.user.hostId||req.user._id); // lấy dữ liệu của chủ garage
                let garageSelected =req.query.garageSelected||"";
                if(!req.body.code){
                    req.body.code = await Ticket.GenerateKeyCode();
                }
                var ticketChecker = await Ticket.find({"recordStatus":1, "hostId": Ticket.ObjectId(req.body.hostId),"licensePlates":req.body.licensePlates,"appointmentTime":req.body.appointmentTime});
                if(!ticketChecker || ticketChecker.length <=0){
                    req.body.appointmentTimeInt = dateFormat('yyyyMMdd',new Date(req.body.appointmentTime)); 
                    let createbyName = (req.user.profile.lastName)+" "+(req.user.profile.firstName);
                    req.body.changeHistory =[{"createdAt":Date.now,"createdIdBy":req.body.createdBy,"createdNameBy":createbyName,"action":"Khởi tạo lịch hẹn"}];
                    Ticket.create(req.body, function (err, small) {
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
                    res.json({ s: 1, msg: "Xe đã được đặt lịch trước đo, vui lòng kiểm tra lại",data:null });
                }
            }
            else{
                res.json({ s: 1, msg: "không tìm thấy dữ liệu",data:null });
            }
        }
        catch(ex){
            res.json({ s: 1, msg: "Có lỗi xảy ra khi xử lý dữ liệu" ,data:ex.toString()});
        }
    }
  };
}

module.exports = new TicketController();