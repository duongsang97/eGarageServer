"use strict";
const jwt = require("jsonwebtoken");
const Users = require("../../models/userModel").Users;
const Profile = require("../../models/profileModel").Profile;
const PRIVITE_KEY = "GzjnaVsUsrsnqDAokPLI";
function AuthenController() {
  return {
    /** @memberOf ServiceManagerController
     * @description List all building
     * @param req
     * @param res
     * @returns {Promise<any>}
     */
    doLogin: async (req, res) => {
        let user = req.body||req.query;
        if (!user || !user.userName || !user.password) {
          return res.json({ s: 1, msg: "Please enter email and password" });
        } else {
          let data = {};
          var userLogin = await Users.findOne({userName: user.userName,password:user.password});
          if(userLogin){
            var profileByUser = await Profile.findOne({_id: userLogin.profile});
            data = {
              _id: userLogin._id,
              hostId:userLogin.hostId,
              profile:profileByUser||{}
            }
          }
          else{
            return res.json({ s: 1, msg: "User does not exist" });
          }

          const token = jwt.sign({exp: Math.floor(Date.now() / 1000) + 60 * 600,data: data,},PRIVITE_KEY);
          data.token = token;
          return res.json({ s: 0, data: data });
        }
    },
    checkLogin: (req, res, next) => {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Credentials", true);
        res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
        res.header(
          "Access-Control-Allow-Headers",
          "Origin,X-Requested-With,Content-Type,Accept,content-type,application/json,Authorization"
        );
        if (req.url === `/api/v1/login`) {
          return next();
        } else {
          try {
            if (req.headers.authorization) {
              const token = (req.headers.authorization).split(" ");
              const user = jwt.verify(token[1], PRIVITE_KEY).data;
              if(user){
                req.user = user;
                return next();
              }
              else{
                return res.status(401).json({s: 1,msg: `Unauthorized error`});
              }
            }
            
          } catch (e) {
            return res.status(401).json({
              s: 1,
              msg: `Unauthorized error`
            });
          }
        }
      },
  };
}

module.exports = new AuthenController();