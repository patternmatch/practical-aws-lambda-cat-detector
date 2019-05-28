'use strict';

const persistence = require('./persistence');
const recognition = require('./recognition');

module.exports.imgClassification = (event, context, callback) => {

    console.log('Received event: %j', event);

    const filesToBeChecked = module.exports.recordsToFiles(module.exports.filterEvents(event));

    filesToBeChecked.forEach(function (fileName) {
        persistence.putStatus(fileName, false, 'new');

        recognition.check(fileName)
            .then((recognitionStatus) => {
                console.log('Image label: ', recognitionStatus);
                persistence.putStatus(fileName, true, recognitionStatus);
            })
            .catch((error) => {
                console.log(error);
                persistence.putStatus(fileName, true, 'error');
            });
    });

    callback(null, event);
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