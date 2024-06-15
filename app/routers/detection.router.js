let express = require("express");
let router = express.Router();
let upload = require("../config/multer.config.js");

const axios = require("axios");
var stream = require("stream");
require("dotenv").config();

const awsWorker = require("../controllers/aws.controller.js");

let audioDetection = require("../Models/detection_audio.model.js");
let videoDetection = require("../Models/detection_video.model.js");
let surveyDetection = require("../Models/detection_survey.model.js");
let Submission = require("../Models/submission.model.js");

// let user = require("../Models/user.model");

// get voice detections by user

router.post("/survey", async (req, res) => {
  const { user_Id, submissionId } = req.body;

  const datainput = {
    age: req.body.age,
    gender: req.body.gender,
    hard_to_wind_down: req.body.hard_to_wind_down,
    no_positive_feeling: req.body.no_positive_feeling,
    breathing_difficulty: req.body.breathing_difficulty,
    lack_of_initiative: req.body.lack_of_initiative,
    over_react_to_situations: req.body.over_react_to_situations,
    trembling: req.body.trembling,
    using_nervous_energy: req.body.using_nervous_energy,
    fear_of_panicking: req.body.fear_of_panicking,
    noting_to_look_forward_to: req.body.noting_to_look_forward_to,
    agitation: req.body.agitation,
    difficulty_relaxing: req.body.difficulty_relaxing,
    feeling_downhearted: req.body.feeling_downhearted,
    intolerance_to_delays: req.body.intolerance_to_delays,
    feeling_close_panic: req.body.feeling_close_panic,
    lack_of_enthusiasm: req.body.lack_of_enthusiasm,
    low_self_worth: req.body.low_self_worth,
    touchiness: req.body.touchiness,
    awareness_of_heart_action: req.body.awareness_of_heart_action,
    irrational_fear: req.body.irrational_fear,
    meaningless_life: req.body.meaningless_life,
  };

  console.log("===========input===============");
  console.log(datainput);
  console.log("====================================");

  await axios
    .post(process.env.FLASKBACKEND + `/predict/survey`, {
      age: [req.body.age],
      gender: [req.body.gender],
      hard_to_wind_down: [req.body.hard_to_wind_down],
      no_positive_feeling: [req.body.no_positive_feeling],
      breathing_difficulty: [req.body.breathing_difficulty],
      lack_of_initiative: [req.body.lack_of_initiative],
      over_react_to_situations: [req.body.over_react_to_situations],
      trembling: [req.body.trembling],
      using_nervous_energy: [req.body.using_nervous_energy],
      fear_of_panicking: [req.body.fear_of_panicking],
      noting_to_look_forward_to: [req.body.noting_to_look_forward_to],
      agitation: [req.body.agitation],
      difficulty_relaxing: [req.body.difficulty_relaxing],
      feeling_downhearted: [req.body.feeling_downhearted],
      intolerance_to_delays: [req.body.intolerance_to_delays],
      feeling_close_panic: [req.body.feeling_close_panic],
      lack_of_enthusiasm: [req.body.lack_of_enthusiasm],
      low_self_worth: [req.body.low_self_worth],
      touchiness: [req.body.touchiness],
      awareness_of_heart_action: [req.body.awareness_of_heart_action],
      irrational_fear: [req.body.irrational_fear],
      meaningless_life: [req.body.meaningless_life],
      dry_mouth: req.body.dry_mouth ? [req.body.dry_mouth] : [0],
    })
    .then(async (flaskRes) => {
      flaskdata = flaskRes;
      console.log("==========Flask Response is============");
      console.log(flaskRes.data);
      console.log("====================================");

      const newDetection = new surveyDetection({
        user_Id,
        level: flaskRes.data.result ? flaskRes.data.result : "No detection",
        score:
          flaskRes.data.result.toUpperCase() != "Normal".toUpperCase()
            ? 0.9
            : 0.4,
        submissionId,
      });

      console.log("==========input data===============");
      console.log({
        user_Id,
        level: flaskRes.data.result ? flaskRes.data.result : "No detection",
        score:
          flaskRes.data.result.toUpperCase() != "Normal".toUpperCase()
            ? 0.9
            : 0.4,
        submissionId,
      });
      console.log("====================================");

      await newDetection
        .save()
        .then(async (respond) => {
          console.log("============saved data================");
          console.log(respond);
          console.log("====================================");
          return res.status(200).json({ data: respond });

          ///comp
        })
        .catch((err) => {
          return res.status(400).json({ msg: err });
        });
    })
    .catch((err) => {
      return res.status(400).json({ msg: err });
    });
});

router.post("/add-submission", async (req, res) => {
  const { user_Id, level, language, word } = req.body;

  const newSubmission = new Submission({
    user_Id,
    status: 0,
  });

  await newSubmission
    .save()
    .then(async (respond) => {
      return res.status(200).json({
        submissionId: respond._id,
        SubmissionData: respond,
      });

      ///comp
    })
    .catch((err) => {
      return res.status(400).json({ msg: "Error!" });
    });
});

router.post("/complete-submission", async (req, res) => {
  let id = req.body.submissionId;

  console.log("Submission Id in complete get:" + id)

  Submission.findById(id)
    .then(async (productObj) => {
      productObj.status = 1;

      console.log(productObj);
      await productObj
        .save()
        .then(async () => {
          let audioDetectionResult = await audioDetection.find({
            submissionId: id,
          });

          let videoDetectionResult = await videoDetection.find({
            submissionId: id,
          });

          let surveyDetectionResult = await surveyDetection.find({
            submissionId: id,
          });

          return res.status(200).json({
            audioDetectionResult: audioDetectionResult,
            videoDetectionResult: videoDetectionResult,
            surveyDetectionResult: surveyDetectionResult,
          });
        })
        .catch((err) => {
          return res.status(400).json("Erro " + err);
        });
    })
    .catch((err) => res.status(400).json("Error " + err));
});

router.route("/detections-by-submission/:id").get(async function (req, res) {
  let id = req.params.id;

  console.log("Submission Id in detection get:" + id)
  let audioDetectionR = await audioDetection.find({ submissionId: id });

  let videoDetectionR = await videoDetection.find({ submissionId: id });

  let surveyDetectionR = await surveyDetection.find({ submissionId: id });

  return res.status(200).json({
    success: true,
    audioDetection: audioDetectionR,
    videoDetection: videoDetectionR,
    surveyDetection: surveyDetectionR,
  });
});

router.route("/suggest-game-for-submission/:id").get(async function (req, res) {
  let id = req.params.id;
  let audioDetectionR = await audioDetection.find({ submissionId: id });

  let videoDetectionR = await videoDetection.find({ submissionId: id });

  let surveyDetectionR = await surveyDetection.find({ submissionId: id });
  //normal difficulty
  let gameId = 1;
  if (
    (audioDetectionR.anger + videoDetectionR.anger) / 2 > 0.5 &&
    (surveyDetectionR.level == "sever" ||
      surveyDetectionR.level == "extreamly sever")
  ) {
    //calming game level easy
    gameId = 0;
  } else if (
    (audioDetectionR.neutral + videoDetectionR.neutral) / 2 > 0.5 &&
    (surveyDetectionR.level == "sever" ||
      surveyDetectionR.level == "extreamly sever")
  ) {
    // make user exsited hard level
    gameId = 2;
  }

  // add logic to selet game

  //change hard code value to get different games
  return res.status(200).json({
    success: true,
    gameId: gameId,
  });
});

router
  .route("/submissions-timeline-by-user/:id")
  .get(async function (req, res) {
    let id = req.params.id;
    Submission.find({ user_Id: id }, function (err, Detections) {
      if (err) {
        console.log(err);
      } else {
        return res.status(200).json({ success: true, data: Detections });
      }
    });
  });

router.route("/audio-detections-by-user/:id").get(function (req, res) {
  let id = req.params.id;
  audioDetection.find({ user_Id: id }, function (err, Detections) {
    if (err) {
      console.log(err);
    } else {
      return res.status(200).json({ success: true, data: Detections });
    }
  });
});

// get one data

router.route("/survey-detections-by-user/:id").get(function (req, res) {
  let id = req.params.id;
  surveyDetection.find({ user_Id: id }, function (err, Detections) {
    if (err) {
      console.log(err);
    } else {
      return res.status(200).json({ success: true, data: Detections });
    }
  });
});
// get one data

router.route("/video-detections-by-user/:id").get(function (req, res) {
  let id = req.params.id;
  videoDetection.find({ user_Id: id }, function (err, Detections) {
    if (err) {
      console.log(err);
    } else {
      return res.status(200).json({ success: true, data: Detections });
    }
  });
});

// get one data

router.route("/audio/:id").get(function (req, res) {
  let id = req.params.id;
  audioDetection.findOne({ _id: id }, function (err, Detections) {
    if (err) {
      console.log(err);
    } else {
      return res.status(200).json({ success: true, data: Detections });
    }
  });
});

router.route("/video/:id").get(function (req, res) {
  let id = req.params.id;
  videoDetection.findOne({ _id: id }, function (err, Detections) {
    if (err) {
      console.log(err);
    } else {
      return res.status(200).json({ success: true, data: Detections });
    }
  });
});

router.route("/survey/:id").get(function (req, res) {
  let id = req.params.id;
  surveyDetection.findOne({ _id: id }, function (err, Detections) {
    if (err) {
      console.log(err);
    } else {
      return res.status(200).json({ success: true, data: Detections });
    }
  });
});

router.route("/video").get(function (req, res) {
  videoDetection.find(function (err, Detections) {
    if (err) {
      console.log(err);
    } else {
      return res.status(200).json({ success: true, data: Detections });
    }
  });
});

router.route("/survey").get(function (req, res) {
  surveyDetection.find(function (err, Detections) {
    if (err) {
      console.log(err);
    } else {
      return res.status(200).json({ success: true, data: Detections });
    }
  });
});

router.route("/audio").get(function (req, res) {
  audioDetection.find(function (err, Detections) {
    if (err) {
      console.log(err);
    } else {
      return res.status(200).json({ success: true, data: Detections });
    }
  });
});

router.post("/video", upload.single("file"), awsWorker.doUpload);

module.exports = router;
