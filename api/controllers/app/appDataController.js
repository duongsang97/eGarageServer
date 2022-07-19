"use strict";
const AppData = require("../../data/serverData");
const Province = require("../../data/hanhChinhVienNam/tinh_tp.json");
const District = require("../../data/hanhChinhVienNam/quan_huyen.json");
const Wards = require("../../data/hanhChinhVienNam/xa_phuong.json");
const removeAccents = require('vn-remove-accents')
function AppDataController() {
  return {
    /** @memberOf ServiceManagerController
     * @description List all building
     * @param req
     * @param res
     * @returns {Promise<any>}
     */
    list: (req, res) => {
        try{
            let typeCode = req.query.typeCode;
            let data =[];
            switch(typeCode){
                case "typeTime": 
                    data = AppData.typeTimeDatas;
                break;
                case "typeLength": 
                    data = AppData.typeLengthDatas;
                break;
                case "discountType": 
                    data = AppData.discountType;
                break;
                case "discountUnit": 
                    data = AppData.discountUnit;
                break;
                case "ticketProcess": 
                    data = AppData.ticketProcess;
                break;
            }
            res.json({ s: 0, msg: "Thành công" ,data:data});
        }
        catch(ex){
            res.json({ s: 1, msg: "Có lỗi xảy ra khi xử lý dữ liệu" ,data:null});
        }
    },
    getProvince: (req,res)=>{
        try{
            let keyword = req.query.keyword||"";
            let data =[];
            Province.forEach(e=>{
                if(e && (removeAccents(e.name_with_type.toUpperCase()).indexOf(removeAccents(keyword.toUpperCase())) >-1)|| e.code == keyword){
                    data.push(e);
                }
            });
            res.json({ s: 0, msg: "Thành công" ,data:data});
        }
        catch(ex){
            console.log(ex);
            res.json({ s: 1, msg: "Có lỗi xảy ra khi xử lý dữ liệu" ,data:null});
        }
    },
    getDistrict: (req,res)=>{
        try{
            let keyword = req.query.keyword||"";
            let provinceCode = req.query.provinceCode||"";
            let data =[];
            District.forEach(e=>{
                if(e && (e.parent_code == provinceCode || e.code == keyword) || (keyword && ((removeAccents(e.name_with_type.toUpperCase()).indexOf(removeAccents(keyword.toUpperCase())) >-1)|| e.code == keyword))){
                    data.push(e);
                }
            });
            res.json({ s: 0, msg: "Thành công" ,data:data});
        }
        catch(ex){
            console.log(ex);
            res.json({ s: 1, msg: "Có lỗi xảy ra khi xử lý dữ liệu" ,data:null});
        }
    },
    getWards:(req,res)=>{
        try{
            let keyword = req.query.keyword||"";
            let DistrictCode = req.query.districtCode||"";
            let data =[];
            Wards.forEach(e=>{
                if(e && (e.parent_code == DistrictCode || e.code == keyword) || (keyword && ((removeAccents(e.name_with_type.toUpperCase()).indexOf(removeAccents(keyword.toUpperCase())) >-1)|| e.code == keyword))){
                    data.push(e);
                }
            });
            res.json({ s: 0, msg: "Thành công" ,data:data});
        }
        catch(ex){
            console.log(ex);
            res.json({ s: 1, msg: "Có lỗi xảy ra khi xử lý dữ liệu" ,data:null});
        }
    }
    
  };
}

module.exports = new AppDataController();