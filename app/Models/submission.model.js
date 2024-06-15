// user.model.js

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Define collection and schema for Users
let detection_submission_relationship = new Schema(
  {
    user_Id: {
      type: String,
    },

    // 0 pending , 1 successful server detection , 2 failed or error server detection, 3 recommend for manual detections, 4 manual detection done
    status: {
      type: Number,
    },
  },

  {
    timestamps: true,
    collection: "detection_submission_relationship",
  }
);

module.exports = mongoose.model(
  "detection_submission_relationship",
  detection_submission_relationship
);
