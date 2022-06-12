const mongoose = require("mongoose");
const config = require("../configs/server.config");
const serverData = require("../api/data/serverData");
const User = require("../api/models/userModel").Users;
const Profile = require("../api/models/profileModel").Profile;
const Menu = require("../api/models/menuModel").Menu;
mongoose.Promise = global.Promise;
const menu =[
  {
    "code": "dashboard",
    "name": "Dashboard",
    "router": "home/dashboard",
    "icon": "fa fas-home",
    "enable": true,
    "apis": [
      {
        "code": "GARAGE_GET",
        "url": "/garage",
        "method": "get",
        "enable": true
      }
    ],
    "children": []
  },
  {
    "code": "store",
    "name": "Kho",
    "router": "home/store",
    "icon": "fa fas-store",
    "enable": true,
    "apis": [
      {
        "url": "/store",
        "method": "get",
        "enable": true
      },
      {
        "url": "/store",
        "method": "post",
        "enable": true
      }
    ],
    "children": [
      {
        "code": "store",
        "name": "Kho",
        "router": "home/store",
        "icon": "fa fas-store",
        "enable": true,
        "apis": [
          {
            "code": "STORE_GET",
            "url": "/store",
            "method": "get",
            "enable": true
          },
          {
            "code": "STORE_POST",
            "url": "/store",
            "method": "post",
            "enable": true
          }
        ]
      }
    ]
  }
];
mongoose
  .connect(config.database.url, {
    useNewUrlParser: true,
  })
  .then(() => {
    console.log("Successfully connected to the database");
    //createSystemUser();
    menu.forEach((item)=>{
      createMenu(item);
    });
  })
  .catch(err => {
    console.log("Could not connect to the database. Exiting now...", err);
    process.exit();
  });

  function createSystemUser() {
    Profile.create({
    firstName: "Sang",
    lastName:"Dương Tấn",
    email: "duongsang97@gmail.com",
    numberPhone: "0378035875",
    address: {}, // địa chỉ
    birthday: "1997-08-10",
    }).then(Response => {
    User.create({
        userName: "duongsang",
        profile: Response._id,
      })
    });
  }

  function createMenu(data) {
    Menu.create(data).then(Response => {
      });
  }