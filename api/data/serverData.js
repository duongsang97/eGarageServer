module.exports = {
    gender:[
        {code:"nam",name:"Nam"},
        {code:"nu",name:"Nữ"},
        {code:"khac",name:"Khác"},
    ],
    passWordDefauld:"123123",
    userStatus:[
        {code:"active",name:"Kích hoạt"},
        {code:"lockup",name:"Khóa"},
    ],
    userType:[
        {code:"customer",name:"Khách hàng"},
        {code:"employee",name:"Nhân viên"},
        {code:"host",name:"Chủ garage"},
    ],
    recordStatus:[0,1],
    pathExceltmp: "excel/tmp",
    pathSaveFile: "upload",
    promotionType:[
        {code:"01",name:"Giảm giá sản phẩm/dịch vụ"},
        {code:"02",name:"Giảm giá hóa đơn khi tiêu phí vực mức"},
        {code:"03",name:"Khuyến mãi theo combo"},
        {code:"04",name:"Tích điểm đổi quà"},
        {code:"05",name:"Mua 1 tặng 1"}
    ],
    promotionValueType:[
        {code:"01",name:"Theo %"},
        {code:"02",name:"Theo tiền"}
    ],
    pathFolderExport: "publics/templates",
    pathFolderExport: "publics/exports",
    pathFolderUpload: "publics/uploads",
    typeTimeDatas:[{"code":"typeMinute","name":"Phút"},{"code":"typeHour","name":"Giờ"},{"code":"typeDay","name":"Ngày"},{"code":"typeMonth","name":"Tháng"},{"code":"typeYear","name":"Năm"}],
    typeLengthDatas:[{"code":"typekm","name":"Km"},{"code":"typeMile","name":"Mile"}],
    
    workType:[
        {code:"01",name:"Chính thức"},
        {code:"02",name:"Thời vụ"}
    ],
    workStatus:[
        {code:"01",name:"Đang hoạt động"},
        {code:"02",name:"Đã nghỉ việc"}
    ],
};