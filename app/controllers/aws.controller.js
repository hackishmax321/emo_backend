const axios = require("axios");

var stream = require("stream");
require("dotenv").config();

const s3 = require("../config/s3.config.js");
let audioDetection = require("../Models/detection_audio.model.js");
let videoDetection = require("../Models/detection_video.model.js");
let surveyDetection = require("../Models/detection_survey.model.js");

exports.doUpload = (req, res) => {
  const s3Client = s3.s3Client;
  const params = s3.uploadParams;

  let user_Id = req.body.user_Id;
  let submissionId = req.body.submissionId;

  params.Key = req.file.originalname;
  params.Body = req.file.buffer;
  params.ACL = "public-read";

  console.log("=========submissionId=================");
            console.log(submissionId);

  // if (req.body.req_type == "audio") {
  //   s3Client.upload(params, async (err, data) => {
  //     if (err) {
  //       console.log(err);
  //       console.log("====================================");
  //       console.log(data);
  //       console.log("====================================");
  //       return res.status(500).json({ error: "Error -> " + err });
  //     }

  //     if (data) {
  //       let audioURL = data.Location;

  //       //  add
  //       //

  //       //
  //       // await axios
  //       //   .post(process.env.FLASKBACKEND + `/predict/kidney-disease/image-prediction`, {
  //       //     url: data.Location,

  //       //   })
  //       //   .then(async (flaskRes) => {
  //       //     console.log("==========Flask Response is============");
  //       //     console.log(flaskRes);
  //       //     console.log("====================================");
  //       //    // update obj

  //       const newDetection = new audioDetection({
  //         user_Id,
  //         audioURL,
  //         anger: 0.6,
  //         fear: 0.6,
  //         neutral: 0.6,
  //         sad: 0.6,
  //         happy: 0.6,
  //         calm: 0.6,
  //         disgust: 0.6,
  //         surprise: 0.6,
  //         submissionId,
  //       });

  //       await newDetection
  //         .save()
  //         .then((savedObj) => {
  //           return res.status(200).json({ data: savedObj });
  //         })
  //         .catch((err) => {
  //           console.log(err);
  //           return res.status(400).json("Erro " + err);
  //         });
  //       // })
  //       // .catch((err) => {
  //       //   console.log(err);
  //       //   return res.status(400).json("Erro " + err);
  //       // });
  //     }
  //   });
  if (req.body.req_type == "video") {
    s3Client.upload(params, async (err, data) => {
      if (err) {
        console.log(err);
        console.log("====================================");
        console.log(data);
        console.log("====================================");
        return res.status(500).json({ error: "Error -> " + err });
      }

      if (data) {
        let videoURL = data.Location;

        //  add

        await axios
          .post(process.env.FLASKBACKEND + `/predict/video`, {
            url: data.Location,
          })
          .then(async (flaskRes) => {
            console.log("==========Flask Response is============");
            console.log(flaskRes.data[0].auido_prediction);
            console.log("====================================");
            console.log("video below");
            console.log("====================================");

            console.log(flaskRes.data[0].video_frames_prediction);
            console.log("====================================");
            console.log(flaskRes.data[0]);
            // update obj

            let anger = 0;
            let fear = 0;
            let neutral = 0;
            let sad = 0;
            let happy = 0;
            let calm = 0;
            let disgust = 0;
            let surprise = 0;
            let smile = 0;

            let audioData;

            if (flaskRes.data[0].video_frames_prediction) {
              for (
                let index = 0;
                index < flaskRes.data[0].video_frames_prediction.length;
                index++
              ) {
                const element = flaskRes.data[0].video_frames_prediction[index];

                if (element.class.toUpperCase() == "Anger".toUpperCase()) {
                  anger = element.average_probability;
                }
                if (element.class.toUpperCase() == "Fear".toUpperCase()) {
                  fear = element.average_probability;
                }
                if (element.class.toUpperCase() == "Neutral".toUpperCase()) {
                  neutral = element.average_probability;
                }
                if (element.class.toUpperCase() == "Sad".toUpperCase()) {
                  sad = element.average_probability;
                }

                if (element.class.toUpperCase() == "smile".toUpperCase()) {
                  smile = element.average_probability;
                }
                if (element.class.toUpperCase() == "Surprise".toUpperCase()) {
                  surprise = element.average_probability;
                }
              }
            }

            const newDetectionvideo = new videoDetection({
              user_Id,
              videoURL,
              anger: anger,
              fear: fear,
              neutral: neutral,
              sad: sad,
              smile: smile,

              surprise: surprise,
              submissionId,
            });

            await newDetectionvideo
              .save()
              .then((savedObj) => {
                audioData = savedObj;
              })
              .catch((err) => {
                console.log(err);
                return res.status(400).json("Erro " + err);
              });

            anger = 0;
            fear = 0;
            neutral = 0;
            sad = 0;
            happy = 0;
            calm = 0;
            disgust = 0;
            surprise = 0;

            let element = flaskRes.data[0].auido_prediction;
            if (element) {
              if (element.class.toUpperCase() == "anger".toUpperCase()) {
                anger = element.probability;
              }
              if (element.class.toUpperCase() == "fear".toUpperCase()) {
                fear = element.probability;
              }
              if (element.class.toUpperCase() == "neutral".toUpperCase()) {
                neutral = element.probability;
              }
              if (element.class.toUpperCase() == "sad".toUpperCase()) {
                sad = element.probability;
              }
              if (element.class.toUpperCase() == "happy".toUpperCase()) {
                happy = element.probability;
              }
              if (element.class.toUpperCase() == "calm".toUpperCase()) {
                calm = element.probability;
              }
              if (element.class.toUpperCase() == "disgust".toUpperCase()) {
                disgust = element.probability;
              }
              if (element.class.toUpperCase() == "surprise".toUpperCase()) {
                surprise = element.probability;
              }
            }
            const newDetection = new audioDetection({
              user_Id,
              videoURL,
              anger: anger,
              fear: fear,
              neutral: neutral,
              sad: sad,
              calm: calm,
              disgust: disgust,
              happy: happy,
              surprise: surprise,
              submissionId,
            });

            await newDetection
              .save()
              .then((savedObj) => {
		console.log({ audioResult: savedObj, videoResult: audioData });
                return res
                  .status(200)
                  .json({ audioResult: savedObj, videoResult: audioData });
              })
              .catch((err) => {
                console.log(err);
                return res.status(400).json("Erro " + err);
              });
          })
          .catch((err) => {
            console.log(err);
            return res.status(400).json("Erro " + err);
          });
      }
    });
  } else {
    s3Client.upload(params, async (err, data) => {
      if (err) {
        console.log(err);
        console.log("====================================");
        console.log(data);
        console.log("====================================");
        return res.status(500).json({ error: "Error -> " + err });
      }

      if (data) {
        let imgURL = data.Location;

        return res.status(200).json({ image: imgURL });
      }
    });
  }
};
