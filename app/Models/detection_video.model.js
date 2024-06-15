// user.model.js

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Define collection and schema for Users
let detection_video_relationship = new Schema(
  {
    anger: {
      type: Number,
    },

    fear: {
      type: Number,
    },

    neutral: {
      type: Number,
    },

    sad: {
      type: Number,
    },

    smile: {
      type: Number,
    },

    surprise: {
      type: Number,
    },

    user_Id: {
      type: String,
    },

    videoURL: {
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
    collection: "detection_video_relationship",
  }
);

module.exports = mongoose.model(
  "detection_video_relationship",
  detection_video_relationship
);
