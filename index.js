var express = require("express");
const helmet = require("helmet"); // Security Http Request
const bodyParser = require("body-parser");
const mongoose = require("mongoose"); // Connect Mongodb
const bytes = require('bytes');
//mongoose.set("useCreateIndex", true);
var app = express(helmet());
var cors = require("cors");
var config = require("./configs/server.config");
const router = require("./api/router/app.router");
var corsOptions = {
  origin: function (origin, callback) {
    if ((config.whitelist.indexOf(origin) !== -1) || config.serverType != "PROC") {
      callback(null, true);
    } else {
      callback("Not allowed by CORS");
    }
  },
};
app.use(cors(corsOptions));
//This overrides the default error handler, and must be called _last_ on the app
app.disable("x-powered-by");
// parse requests of content-type - application/json
app.use(bodyParser.json());
// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: true,limit:bytes(50000)}));
let usePort = process.env.PORT||config.appConfig.port;
app.listen(usePort);
console.log("Server Boarding House Running On: " + usePort);
//

app.use("/api/v1/", router);
app.use('/publics', express.static('publics'))
app.use("/", (req, res) => {
  return res.send("The server is temporarily unavailable!");
});

mongoose.Promise = global.Promise;
mongoose.connect(config.database.url, {
    keepAlive: true,
    serverSelectionTimeoutMS: 10000, // Keep trying to send operations for 10 seconds
    socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
}).then(() => {
    console.log("Successfully connected to the database");
}).catch(err => {
    console.log("Could not connect to the database. Exiting now...", err);
    process.exit();
});