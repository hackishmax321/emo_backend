const AWS = require("aws-sdk");
// const env = require("./s3.env.js");
require("dotenv").config();

const s3Client = new AWS.S3({
  accessKeyId: AWS_ACCESS_KEY,
  secretAccessKey: AWS_SECRET_ACCESS_KEY,
  region: REGION,
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
