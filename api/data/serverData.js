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
    discountType:[{"code":"dis01","name":"Tự động"},{"code":"dis02","name":"Trực tiếp"}],
    discountUnit:[{"code":"unitDis01","name":"Tiền mặt"},{"code":"unitDis02","name":"Phần trăm (%)"}],
    ticketProcess:[{"code":"step0","name":"Đặt lịch"},{"code":"step01","name":"Tiếp nhận",},
        {"code":"step02","name":"Kiểm tra",},{"code":"step03","name":"Báo giá",},{"code":"step04","name":"Thực hiện",},
        {"code":"step05","name":"Nghiệm thu",},{"code":"step06","name":"Thanh toán",},{"code":"step07","name":"Hoàn thành",},
        {"code":"step-1","name":"Hủy bỏ",}
    ]
};