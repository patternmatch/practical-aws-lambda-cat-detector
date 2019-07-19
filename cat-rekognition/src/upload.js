'use strict';

const config = require('./config');
const AWSXRay = require('aws-xray-sdk');
const AWS = AWSXRay.captureAWS(require('aws-sdk'));
const s3 = new AWS.S3();

const CORS_HEADERS = { 'Access-Control-Allow-Origin': '*' };

module.exports.saveToS3 = async (event, _context) => {
  console.log(event);

  var validation_result = module.exports.validateInput(event)
  if (validation_result.valid) {
    const s3Params = {
      Bucket: config().serverless_cat_detector_img_repo,
      Key: validation_result.params.name,
      ContentType: validation_result.params.type,
      ACL: 'public-read'
    };

    const uploadURL = s3.getSignedUrl('putObject', s3Params);

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({ uploadURL: uploadURL })
    }
  } else {
    return {
      statusCode: 400,
      headers: CORS_HEADERS,
      body: JSON.stringify({reason: validation_result.reason})
    }
  }
};

module.exports.validateInput = (event) => {
  var params = {};

  if (typeof event.headers['content-type'] === 'undefined' || !event.headers['content-type']) {
    return { valid: false, reason: "content-type is missing" }
  }

  if (!event.headers['content-type'].startsWith("application/json")) {
    return { valid: false, reason: "content type is not application/json" }
  }

  try {
    params = JSON.parse(event.body);
  } catch (e) {
    return { valid: false, reason: e }
  }

  if (typeof params.type === 'undefined' || typeof params.name === 'undefined') {
    return { valid: false, reason: "lack of name or type param in json body" }
  }

  const allowedContentTypes = ["image/png", "image/gif", "image/jpeg"];
  if (!allowedContentTypes.includes(params.type)) {
    return { valid: false, reason: "invalid content type" }
  }

  return { valid: true, params: params }
};

