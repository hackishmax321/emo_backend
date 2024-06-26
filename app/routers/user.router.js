const express = require("express");
const userRoutes = express.Router();
const bcrypt = require("bcrypt");

var nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
// var Mailgen = require("mailgen");

let user = require("../Models/user.model");

//email configurarion
// function sendMail(mailOptions) {
//   var transporter = nodemailer.createTransport({
//     service: "gmail",
//     auth: {
//       user: "ravindudeshaninfo@gmail.com",
//       pass: "Homagama502",
//     },
//   });

//   transporter.sendMail(mailOptions, function (error, info) {
//     if (error) {
//       console.log("Email error Occured", error);
//     } else {
//       console.log("Email sent: " + info.response);
//     }
//   });
// }

// add user

userRoutes.post("/add", async (req, res) => {
  const {
    address,
    email,
    gender,
    age,

    firstname,
    lastname,
    mobile,
    password,
    conpass,
  } = req.body;

  if (
    address == "" ||
    firstname == "" ||
    mobile == "" ||
    password == "" ||
    conpass == "" ||
    lastname == ""
  )
    return res.status(200).json({ warn: "Important field(s) are empty" });

  const exist = await user.findOne({ mobile: mobile });
  if (exist) {
    return res
      .status(200)
      .json({ warn: "An account is Exist with this mobile" });
  }

  const salt = await bcrypt.genSalt();
  const passwordHash = await bcrypt.hash(password, salt);

  if (password !== conpass)
    return res.status(200).json({ warn: "Passwords Do not Match!" });

  // const exist2 = await user.findOne({ address: address });
  // if (exist2) {
  //   return res
  //     .status(200)
  //     .json({ warn: "This address is already taken.Try another one" });
  // }

  const newUser = new user({
    address,
    email,
    password: passwordHash,
    gender,
    age,

    firstname,
    lastname,
    mobile,
  });

  await newUser
    .save()
    .then(async (respond) => {
      res.status(200).json({ msg: "Successfull" });

      ///comp
    })
    .catch((err) => {
      res.status(400).json({ msg: err });
    });
});

//token validate

userRoutes.post("/validate", async (req, res) => {
  // console.log("Secret is :" , config.JWT_SECRET);

  const { mobile, password } = req.body;

  console.log(req.body);

  try {
    const Login = await user.findOne({ mobile: mobile });

    console.log("==========login==================");
    console.log(Login);
    console.log("====================================");

    if (mobile == "" || password == "")
      return res
        .status(200)
        .json({ msg: "mobile or password fields are empty" });

    if (!Login) return res.status(200).json({ msg: "Invalid mobile" });

    const validate = await bcrypt.compare(password, Login.password);

    if (!validate) {
      return res.status(200).json({ msg: "password is Invalid!" });
    }

    //jwt secret
    const token = jwt.sign({ id: Login._id }, process.env.JWT_SECRET, {
      expiresIn: 3000,
    });
    res.status(200).json({
      token,
      Info: {
        id: Login._id,
        mobile: Login.mobile,
        //   type: Login.type,
        firstname: Login.firstname,
        lastname: Login.lastname,
        // img: Login.img,
      },
      User: Login,
    });
  } catch (err) {
    res.status(400).json({ msg: "Validation Error" });
    console.log("Error is ", err);
  }
});

// User Session Validation by token
// userRoutes.get("/session-validate", async (req, res) => {
//   try {
//     const token = req.header("token");

//     console.log("validation is :", token);
//     if (!token) return res.json(false);

//     const validate = jwt.verify(token, process.env.JWT_SECRET);
//     if (!validate) return res.json(false);

//     const Login = await user.findById(validate.id);
//     if (!Login) return res.json(false);

//     return res.json(true);
//   } catch (error) {
//     res.status(400).json({ msg: "Validation Error" });
//     console.log("Error is ", error);
//   }
// });

// update

userRoutes.post("/update/:id", async (req, res) => {
  console.log(req.body);

  user
    .findById(req.params.id)
    .then((productObj) => {
      productObj.firstname = req.body.firstname;
      productObj.lastname = req.body.lastname;
      productObj.mobile = req.body.mobile;
      productObj.area_of_plantation = req.body.area_of_plantation;
      // productObj.mobile = req.body.mobile;

      console.log(productObj);
      productObj
        .save()
        .then(() => res.json("Updated"))
        .catch((err) => res.status(400).json("Erro " + err));
    })
    .catch((err) => res.status(400).json("Error " + err));
});

// get user by Id
userRoutes.route("/:id").get(function (req, res) {
  let id = req.params.id;
  user.findOne({ _id: id }, function (err, User) {
    if (err) {
      console.log(err);
    } else {
      res.status(200).json({ success: true, User: User });
    }
  });
});

// all users
userRoutes.get("/", async (req, res) => {
  await user
    .find(function (err, users) {
      if (err) {
        console.log(err);
      } else {
        res.status(200).json({ success: true, data: users });
      }
    })
    .sort({ updatedAt: 1 });
});

module.exports = userRoutes;
