// Admin.model.js

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Define collection and schema for Admins
let Admin_kidney = new Schema(
  {
    username: {
      required: true,
      unique: true,
      type: String,
    },
    password: {
      required: true,
      type: String,
    },

    type: {
      required: true,

      type: String,
    },
    firstname: {
      type: String,
    },
    lastname: {
      type: String,
    },
  },
  {
    timestamps: true,
    collection: "Admin_kidney",
  }
);

module.exports = mongoose.model("Admin_kidney", Admin_kidney);
