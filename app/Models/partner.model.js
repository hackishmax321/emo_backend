// partner.model.js

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Define collection and schema for partners
let partner_kidney = new Schema(
  {
    company: {
      required: true,
      type: String,
    },
    // senior , junior , intern etc
    type: {
      required: true,
      type: String,
    },
    email: {
      required: true,
      type: String,
      unique: true,
    },

    password: {
      required: true,
      type: String,
    },
    mobile: {
      required: true,
      type: String,
    },
    designation: {
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
    collection: "partner_kidney",
  }
);

module.exports = mongoose.model("partner_kidney", partner_kidney);
