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

            await axios
                .post(process.env.FLASKBACKEND + `/predict/video`, {
                    url: data.Location,
                })
                .then(async (flaskRes) => {
                    let flaskData = flaskRes.data;

                    // Initialize emotion counters
                    let emotions = {
                        anger: 0,
                        fear: 0,
                        neutral: 0,
                        sad: 0,
                        happy: 0,
                        calm: 0,
                        disgust: 0,
                        surprise: 0,
                        smile: 0,
                    };

                    // Initialize emotion counts
                    let emotionCounts = {
                        anger: 0,
                        fear: 0,
                        neutral: 0,
                        sad: 0,
                        happy: 0,
                        calm: 0,
                        disgust: 0,
                        surprise: 0,
                        smile: 0,
                    };

                    // Process video frame predictions
                    if (flaskData) {
                        flaskData.forEach((prediction) => {
                            let videoPrediction = prediction.video_frames_prediction;
                            if (videoPrediction) {
                                if (videoPrediction.class) {
                                    let emotionClass = videoPrediction.class.toLowerCase();
                                    if (emotions[emotionClass] !== undefined) {
                                        emotions[emotionClass] += videoPrediction.probability;
                                        emotionCounts[emotionClass] += 1;
                                    }
                                }
                            }

                            let audioPrediction = prediction.audio_prediction;
                            if (audioPrediction) {
                                let emotionClass = audioPrediction.class.toLowerCase();
                                if (emotions[emotionClass] !== undefined) {
                                    emotions[emotionClass] += audioPrediction.probability;
                                    emotionCounts[emotionClass] += 1;
                                }
                            }
                        });
                    }

                    // Calculate averages
                    for (let emotion in emotions) {
                        if (emotionCounts[emotion] > 0) {
                            emotions[emotion] = emotions[emotion] / emotionCounts[emotion];
                        } else {
                            emotions[emotion] = 0;
                        }
                    }

                    // Prepare data to save
                    const newDetectionvideo = new videoDetection({
                        user_Id,
                        videoURL,
                        anger: emotions.anger,
                        fear: emotions.fear,
                        neutral: emotions.neutral,
                        sad: emotions.sad,
                        smile: emotions.smile,
                        surprise: emotions.surprise,
                        submissionId,
                    });

                    let audioData;
                    await newDetectionvideo.save()
                        .then((savedObj) => {
                            audioData = savedObj;
                        })
                        .catch((err) => {
                            console.log(err);
                            return res.status(400).json("Error " + err);
                        });

                    // Reset emotions for audio detection
                    for (let emotion in emotions) {
                        emotions[emotion] = 0;
                    }

                    // Process the single audio prediction again (assuming the structure of the received data)
                    let element = flaskData[0].audio_prediction;
                    if (element) {
                        let emotionClass = element.class.toLowerCase();
                        if (emotions[emotionClass] !== undefined) {
                            emotions[emotionClass] = element.probability;
                        }
                    }

                    const newDetection = new audioDetection({
                        user_Id,
                        videoURL,
                        anger: emotions.anger,
                        fear: emotions.fear,
                        neutral: emotions.neutral,
                        sad: emotions.sad,
                        calm: emotions.calm,
                        disgust: emotions.disgust,
                        happy: emotions.happy,
                        surprise: emotions.surprise,
                        submissionId,
                    });

                    await newDetection.save()
                        .then((savedObj) => {
                            console.log({ audioResult: savedObj, videoResult: audioData });
                            return res.status(200).json({ audioResult: savedObj, videoResult: audioData });
                        })
                        .catch((err) => {
                            console.log(err);
                            return res.status(400).json("Error " + err);
                        });
                })
                .catch((err) => {
                    console.log(err);
                    return res.status(400).json("Error " + err);
                });
        }
    });
}
 else {
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
