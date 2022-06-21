"use strict";
const AppData = require("../../data/serverData");
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
            }
            res.json({ s: 0, msg: "Thành công" ,data:data});
        }
        catch(ex){
            res.json({ s: 1, msg: "Có lỗi xảy ra khi xử lý dữ liệu" ,data:null});
        }
    },
    
  };
}

module.exports = new AppDataController();