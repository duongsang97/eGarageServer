"use strict";
const Ticket = require("../../models/tickets/ticketModel").Ticket;
const Garage = require("../../models/garages/garageModel").Garage;
const ObjectId = require('mongoose').Types.ObjectId;
const dateFormat = require('date-format');
const serverData = require("../../data/serverData");
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
                let dateNow = new Date();
                let fromDate = new Date((req.query.fromDate)?new Date(req.query.fromDate).setUTCHours(0,0,0):new Date().setUTCHours(0,0,0));
                let toDate =  new Date((req.query.toDate)?new Date(req.query.toDate).setUTCHours(23,59,59):new Date(fromDate).setUTCHours(23,59,59));
                let dateQuery ={ $gte:fromDate,$lt:toDate};
                Ticket.aggregate(
                [
                    {$match:{
                        $and: [
                            {
                                $or:[{ "licensePlates" : { $regex: keyword}},{ "code" : { $regex: keyword}},{ "phoneNumber" : { $regex: keyword}}]
                            },
                            {
                                $or:[{"updatedAt":dateQuery},{"appointmentTime":dateQuery}]
                            },
                            {
                                "recordStatus":1, "hostId":hostId,
                            }
                            ]
                        }
                    },
                    {
                        $lookup:{
                            from: "g_bills", // collection name in db
                            localField: "_id",
                            foreignField: "billId",
                            as: "billInfo"
                        }
                    },
                ]
                ).skip((perPage * page) - perPage).limit(perPage).exec((err, items) => {
                    Ticket.countDocuments((err, count) => { // đếm để tính có bao nhiêu trang
                      if (err){
                        return res.json({ s: 1, msg: "không tìm thấy dữ liệu",data:err });
                      }
                        return res.json({ s: 0, msg: "Thành công",data:items||[] ,listCount: (items||[]).length});
                    });
                  });
                // Ticket.find({
                //     $and: [
                //         {
                //             $or:[{ "licensePlates" : { $regex: keyword}},{ "code" : { $regex: keyword}},{ "phoneNumber" : { $regex: keyword}}]
                //         },
                //         {
                //             $or:[{"updatedAt":dateQuery},{"appointmentTime":dateQuery}]
                //         },
                //         {
                //             "recordStatus":1, "hostId":hostId,
                //         }
                //     ]
                // }).populate('billId').sort({"level":-1,"updatedAt":1,}).skip((perPage * page) - perPage).limit(perPage).exec((err, items) => {
                //     Ticket.countDocuments((err, count) => { // đếm để tính có bao nhiêu trang
                //       if (err){
                //         return res.json({ s: 1, msg: "không tìm thấy dữ liệu",data:err });
                //       }
                //         return res.json({ s: 0, msg: "Thành công",data:items||[] ,listCount: (items||[]).length});
                //     });
                //   });
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
                let keySearch= [{ "_id" : Ticket.ObjectId(keyword)},{ "code" : keyword},{ "licensePlates" : { $regex: keyword}},{ "code" : keyword},{ "phoneNumber" :keyword}];
                Ticket.findOne({
                    $and:[
                        {
                            $or:keySearch
                        },
                        {"recordStatus":1, "hostId": Ticket.ObjectId(hostId)}
                    ]
                }).populate('billId').then((result)=>{
                    return res.json({ s: 0, msg: "Thành công",data:result||{}});
                })
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
                req.body.createdBy = Ticket.ObjectId(req.user._id);
                req.body.updatedBy = Ticket.ObjectId(req.user._id);
                req.body.hostId = Ticket.ObjectId(req.user.hostId||req.user._id); // lấy dữ liệu của chủ garage
                if(!req.body.code){
                    req.body.code = await Ticket.GenerateKeyCode();
                }
                if(!req.body.process){
                    req.body.process = serverData.ticketProcess[1];
                }
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
                req.body.updatedBy = Ticket.ObjectId(req.user._id);
                req.body.hostId = Ticket.ObjectId(req.user.hostId||req.user._id); // lấy dữ liệu của chủ garage
                // kiểm tra nếu dữ liệu thuộc garage --> mới dc cập nhật
                Ticket.findByIdAndUpdate(req.body._id,req.body, function (err, small) {
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