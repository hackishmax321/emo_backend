const express = require("express");
const app = express();

require("dotenv").config();

const bodyParser = require("body-parser");
const PORT = process.env.PORT;
const cors = require("cors");

const mongoose = require("mongoose");

// const userRoute = require("./app/routers/user.router");
const detectionRoute = require("./app/routers/detection.router");

const userRoute = require("./app/routers/user.router");
const partnerRoute = require("./app/routers/partner.router");
// const IoTRoute = require("./app/routers/IoT.router");
// nodemon start
// const fertilizerRoute = require("./app/routers/fertilizer.router");
const staffRoute = require("./app/routers/staff.router");

mongoose.Promise = global.Promise;
mongoose
  .connect(process.env.MONGO, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  })
  .then(
    () => {
      console.log("Database is connected");
    },
    (err) => {
      console.log("Can not connect to the database" + err);
    }
  );

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// app.use("/user", userRoute);
app.use("/detection", detectionRoute);
// app.use("/partner", partnerRoute);
app.use("/user", userRoute);

// app.use("/device", IoTRoute);
// app.use("/fertilizer-detection", fertilizerRoute);
app.use("/staff", staffRoute);

HOST = "192.168.56.1";
// Create a Server
const server = app.listen(PORT, function () {
  let host = server.address().address;
  let port = server.address().port;

  console.log("App listening at http://%s:%s", host, port);
});
