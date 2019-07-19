'use strict';

const config = require('./config');
const AWSXRay = require('aws-xray-sdk');
const AWS = AWSXRay.captureAWS(require('aws-sdk'));
const dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports.dbItem = (fileName, scanned, scanningStatus) => {
    return {
        TableName: config().serverless_cat_detector_results_table,
        Item: {
            'name': fileName,
            'checked': scanned,
            'status': scanningStatus
        }
    };
};

module.exports.putStatus = (fileName, scanned, scanningStatus) => {
    const statusItem = module.exports.dbItem(fileName, scanned, scanningStatus);
    return dynamoDb.put(statusItem).promise();
};

module.exports.getStatusOfAll = async () => {
    const params = {
        TableName: config().serverless_cat_detector_results_table,
        AttributesToGet: ["name", "checked", "status"]
    };
    return  (await dynamoDb.scan(params).promise()).Items;
}