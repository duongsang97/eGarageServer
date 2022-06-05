const mongoose = require("mongoose");
const config = require("../configs/server.config");
const serverData = require("../api/data/serverData");
const User = require("../api/models/userModel").Users;
const Profile = require("../api/models/profileModel").Profile;
mongoose.Promise = global.Promise;
mongoose
  .connect(config.database.url, {
    useNewUrlParser: true,
  })
  .then(() => {
    console.log("Successfully connected to the database");
    createSystemUser();
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