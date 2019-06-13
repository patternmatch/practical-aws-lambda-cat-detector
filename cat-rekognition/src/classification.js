'use strict';

const persistence = require('./persistence');
const recognition = require('./recognition');

module.exports.imgClassification = (event, context, callback) => {

    console.log('Received event: %j', event);

    const filesToBeChecked = module.exports.recordsToFiles(module.exports.filterEvents(event));

    filesToBeChecked.forEach(function (fileName) {
        let statusNew = persistence.putStatus(fileName, false, 'new');

        statusNew.then(function () {
            recognition.check(fileName)
                .then((recognitionStatus) => {
                    console.log('Image label: ', recognitionStatus);
                    persistence.putStatus(fileName, true, recognitionStatus).then(function () {
                        console.log("Recognition success. Status updated.");
                        callback(null, event);
                    });
                })
                .catch((error) => {
                    console.log(error);
                    persistence.putStatus(fileName, true, 'error').then(function () {
                        console.log("Recognition error. Status updated.");
                        callback(null, event);
                    });
                });
        }).catch(function (err) {
            console.log(err);
            callback(null, event);
        });
    });
};

module.exports.filterEvents = (s3Events) => {
    const records = s3Events['Records'];
    const fileAddedEvents = records.filter(function (event) {
        return event['eventName'] == 'ObjectCreated:Put'
    });
    return fileAddedEvents;
};

module.exports.recordsToFiles = (s3Records) => {
    return s3Records.map(function (record) {
        return record['s3']['object']['key'];
    });
};