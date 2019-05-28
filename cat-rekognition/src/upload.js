'use strict';

const config = require('./config');
const AWSXRay = require('aws-xray-sdk');
const AWS = AWSXRay.captureAWS(require('aws-sdk'));
const s3 = new AWS.S3();

const CORS_HEADERS = { 'Access-Control-Allow-Origin': '*' };

module.exports.saveToS3 = (event, context, callback) => {
  console.log(event);

  var validInput = (params) => {
    const s3Params = {
      Bucket: config().serverless_cat_detector_img_repo,
      Key: params.name,
      ContentType: params.type,
      ACL: 'public-read'
    };

    const uploadURL = s3.getSignedUrl('putObject', s3Params);

    callback(null, {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({ uploadURL: uploadURL })
    });
  }

  var invalidInput = (errorMsg) => {
    callback(null, {
      statusCode: 400,
      headers: CORS_HEADERS,
      body: JSON.stringify({reason: errorMsg})
    })
  }

  module.exports.validateInput(event, validInput, invalidInput); 
};

module.exports.validateInput = (event, onSuccessCb, onErrorCb) => {
  var params = {};

  if (typeof event.headers['content-type'] === 'undefined' || !event.headers['content-type']) {
    onErrorCb("content-type is missing");
    return;
  }

  if (!event.headers['content-type'].startsWith("application/json")) {
    onErrorCb("content type is not application/json");
    return;
  }

  try {
    params = JSON.parse(event.body);
  } catch (e) {
    onErrorCb(e);
    return;
  }

  if (typeof params.type === 'undefined' || typeof params.name === 'undefined') {
    onErrorCb("lack of name or type param in json body");
    return;
  }

  const allowedContentTypes = ["image/png", "image/gif", "image/jpeg"];
  if (!allowedContentTypes.includes(params.type)) {
    onErrorCb("invalid content type");
    return;
  }

  onSuccessCb(params);
};

