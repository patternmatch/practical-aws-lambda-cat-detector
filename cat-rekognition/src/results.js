'use strict';

const config = require('./config');
const persistence = require('./persistence');
const CORS_HEADERS = { 'Access-Control-Allow-Origin': '*' };

const AWSXRay = require('aws-xray-sdk');
const AWS = AWSXRay.captureAWS(require('aws-sdk'));
const s3 = new AWS.S3();

module.exports.getClassification = async (event, _context) => {
  console.log(event);
  try {
    var Items = (await persistence.getStatusOfAll())
    console.log(Items)

    var params = { Bucket: config().serverless_cat_detector_img_repo };
    var bucketRegion = (await s3.getBucketLocation(params).promise()).LocationConstraint
    
    var results = Items.map((i) => {
      return {
        name: i.name,
        imageUrl: `https://s3-${bucketRegion}.amazonaws.com/${config().serverless_cat_detector_img_repo}/${i.name}`,
        status: i.status,
        checked: getChecked(i)
      };
    });

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify(results)
    };
  } catch (error) {
    console.log(error)
    return {
      statusCode: 400,
      headers: CORS_HEADERS,
      body: JSON.stringify({ reason: error })
    }
  }
};

var getChecked = (Item) => {
  if (Item.checked === true) {
    return "checked";
  } else {
    return "pending";
  }
}