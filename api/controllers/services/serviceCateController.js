"use strict";
const ServiceCate = require("../../models/services/serviceCategory").ServiceCate;
function ServiceCateController() {
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
                ServiceCate.find({
                    $and: [
                        {
                            $or: [{"ofGarage":{}},{"ofGarage.code":garageSelected}],
                        },
                        {
                            $or:[{ "name" : { $regex: keyword}},{ "code" : { $regex: keyword}}]
                        },
                        {"recordStatus":1, "hostId":hostId}
                    ]
                }).skip((perPage * page) - perPage).limit(perPage).exec((err, items) => {
                    ServiceCate.countDocuments((err, count) => { // đếm để tính có bao nhiêu trang
                      if (err){
                        return res.json({ s: 1, msg: "không tìm thấy dữ liệu",data:err });
                      }
                        return res.json({ s: 0, msg: "Thành công",data:items||[] });
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
    create:(req, res) => {
        try{
            if(req.user && (req.body && req.body.hasOwnProperty("code"))){
                req.body.createdBy = ServiceCate.ObjectId(req.user._id);
                req.body.updatedBy = ServiceCate.ObjectId(req.user._id);
                req.body.ofHost = ServiceCate.ObjectId(req.user.hostId||req.user._id); // lấy dữ liệu của chủ garage
                ServiceCate.create(req.body, function (err, small) {
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
                req.body.updatedBy = ServiceCate.ObjectId(req.user._id);
                req.body.ofHost = ServiceCate.ObjectId(req.user.hostId||req.user._id); // lấy dữ liệu của chủ garage
                // kiểm tra nếu dữ liệu thuộc garage --> mới dc cập nhật
                return ServiceCate.findById(req.body._id).exec().then((result)=>{
                    if(result){
                        // xác định có phải service cate global hay ko?
                        if((result.ofGarage=={} || !result.ofGarage) && result.hostId != req.user._id){
                            return res.json({ s: 1, msg: "Không có quyền",data:null});
                        }
                        else{
                            ServiceCate.findByIdAndUpdate(req.body._id,req.body, function (err, small) {
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

module.exports = new ServiceCateController();