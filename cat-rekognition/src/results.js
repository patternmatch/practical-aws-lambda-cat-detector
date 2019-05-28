'use strict';

const config = require('./config');
const persistence = require('./persistence');
const CORS_HEADERS = { 'Access-Control-Allow-Origin': '*' };

module.exports.getClassification = (event, context, callback) => {
  console.log(event);
  persistence.getStatusOfAll().then((Items) => {
    console.log(Items);

    var results = Items.map((i) => {
      return {
        name: i.name,
        imageUrl: "https://s3-eu-west-1.amazonaws.com/" + config().serverless_cat_detector_img_repo + "/" + i.name,
        status: i.status,
        checked: getChecked(i)
      };
    });

    const response = {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify(results)
    };

    callback(null, response);
  })
    .catch((error) => {
      const response = {
        statusCode: 400,
        headers: CORS_HEADERS,
        body: JSON.stringify({ reason: message })
      }
      callback(null, response);
    });
};

var getChecked = (Item) => {
  if (Item.checked === true) {
    return "checked";
  } else {
    return "pending";
  }
}