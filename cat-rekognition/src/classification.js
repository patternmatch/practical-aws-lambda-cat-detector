'use strict';

const persistence = require('./persistence');
const recognition = require('./recognition');

module.exports.imgClassification = async (event, _context) => {

    console.log('Received event: %j', event);

    const filesToBeChecked = module.exports.recordsToFiles(module.exports.filterEvents(event));
    for (var i = 0; i< filesToBeChecked.length; ++i){
        let fileName = filesToBeChecked[i]
        await persistence.putStatus(fileName, false, 'new')
        try {
            let recognitionStatus = await recognition.check(fileName)
            await persistence.putStatus(fileName, true, recognitionStatus)
            console.log("Recognition success. Status updated.")
        } catch (error) {
            console.log(error);
            await persistence.putStatus(fileName, true, 'error')
            console.log("Recognition error. Status updated.")
        }
    }
}

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