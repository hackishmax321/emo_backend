const AWS = require("aws-sdk");
// const env = require("./s3.env.js");
require("dotenv").config();

const s3Client = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.REGION,
});

const uploadParams = {
  Bucket: "cicdadmin-devopscicddemocicdadmin",
  Key: "", // pass key
  Body: null, // pass file body
};

const s3 = {};
s3.s3Client = s3Client;
s3.uploadParams = uploadParams;

module.exports = s3;
