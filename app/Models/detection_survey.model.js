// user.model.js

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Define collection and schema for Users
let detection_survey_relationship2 = new Schema(
  {
    level: {
      type: String,
    },

    score: {
      type: Number,
    },

    user_Id: {
      type: String,
    },

    submissionId: {
      type: String,
    },

    // 0 pending , 1 successful server detection , 2 failed or error server detection, 3 recommend for manual detections, 4 manual detection done
    status: {
      type: Number,
    },
  },

  {
    timestamps: true,
    collection: "detection_survey_relationship2",
  }
);

module.exports = mongoose.model(
  "detection_survey_relationship2",
  detection_survey_relationship2
);
