'use strict';

const config = require('./config');
const AWSXRay = require('aws-xray-sdk');
const AWS = AWSXRay.captureAWS(require('aws-sdk'));
const rekognition = new AWS.Rekognition();

module.exports.check = async (fileName) => {
    const params = {
        Image: {
            S3Object: {
                Bucket: config().serverless_cat_detector_img_repo,
                Name: fileName
            }
        },
        MaxLabels: 10,
        MinConfidence: 60
    };
    return module.exports.imageLabel(await rekognition.detectLabels(params).promise())
};

module.exports.imageLabel = (data) => {
    const isCat = module.exports.isCatRecognized(data);
    if (isCat) {
        return 'cat';
    } else {
        return 'other';
    }
};

module.exports.isCatRecognized = (rawLabels) => {
    const labels = rawLabels.Labels;
    return labels.some(function (label) { return label.Name == 'Cat' });
};