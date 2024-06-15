const express = require("express");
const userRoutes = express.Router();
const bcrypt = require("bcrypt");

var nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
// var Mailgen = require("mailgen");

let user = require("../Models/partner.model");

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
    company,
    email,
    type,
    firstname,
    lastname,
    mobile,
    designation,
    password,
  } = req.body;

  if (
    company == "" ||
    email == "" ||
    type == "" ||
    firstname == "" ||
    mobile == "" ||
    password == "" ||
    designation == "" ||
    lastname == ""
  )
    return res.status(200).json({ msg: "Important field(s) are empty" });

  const salt = await bcrypt.genSalt();
  const passwordHash = await bcrypt.hash(password, salt);

  const exist = await user.findOne({ email: email });
  if (exist) {
    return res
      .status(200)
      .json({ warn: "An account is Exist with this email" });
  }

  // const exist2 = await user.findOne({ company: company });
  // if (exist2) {
  //   return res
  //     .status(200)
  //     .json({ warn: "This company is already taken.Try another one" });
  // }

  const newUser = new user({
    company,
    email,
    type,
    firstname,
    lastname,
    mobile,
    designation,
    password: passwordHash,
  });

  await newUser
    .save()
    .then(async (respond) => {
      res.status(200).json({ msg: "Successfull" });

      ///comp
    })
    .catch((err) => {
      res.status(400).json({ msg: "Error!" });
    });
});

//token validate

userRoutes.post("/validate", async (req, res) => {
  // console.log("Secret is :" , config.JWT_SECRET);

  const { password, email } = req.body;

  try {
    const Login = await user.findOne({ email: email });

    if (password == "" || email == "")
      return res.status(200).json({ msg: "company or email fields are empty" });

    if (!Login) return res.status(200).json({ msg: "Invalid company" });

    const validate = await bcrypt.compare(password, Login.password);

    if (!validate) {
      return res.status(200).json({ msg: "email is Invalid!" });
    }

    //jwt secret
    const token = jwt.sign({ id: Login._id }, process.env.JWT_SECRET, {
      expiresIn: 3000,
    });
    res.status(200).json({
      token,
      Info: {
        id: Login._id,
        company: Login.company,
        type: Login.email,
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
      productObj.password = req.body.password;
      productObj.company = req.body.company;
      productObj.email = req.body.email;
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
