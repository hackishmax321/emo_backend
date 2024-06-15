// user.model.js

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Define collection and schema for users
let user_relationship = new Schema(
  {
    address: {
      required: true,
      type: String,
    },
    // senior , junior , intern etc

    email: {
      type: String,
    },

    password: {
      required: true,
      type: String,
    },

    mobile: {
      required: true,
      type: String,
      unique: true,
    },

    firstname: {
      type: String,
    },
    lastname: {
      type: String,
    },

    age: {
      type: Number,
    },

    gender: {
      type: Number,
    },
  },
  {
    timestamps: true,
    collection: "user_relationship",
  }
);

module.exports = mongoose.model("user_relationship", user_relationship);
