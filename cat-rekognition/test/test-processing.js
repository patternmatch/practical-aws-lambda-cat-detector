var chai = require('chai'),
    expect = chai.expect;

const lambda = require("../src/classification.js");
const persistence = require("../src/persistence");
const recognition = require("../src/recognition");

describe('Test processing', function () {
    it('should accept create event', function () {
        const objectCreatedEvent = '{ "Records":[ { "eventVersion":"2.0", "eventSource":"aws:s3", "awsRegion":"eu-west-1", "eventTime":"2017-11-07T14:48:17.640Z", "eventName":"ObjectCreated:Put", "userIdentity":{ "principalId":"AWS:AIDAIO4UECELEIKQL727W" }, "requestParameters":{ "sourceIPAddress":"64.236.4.1" }, "responseElements":{ "x-amz-request-id":"E9539EA0992FE185", "x-amz-id-2":"i9fnN8mAGRF/AR4TSV4hcCSWn0b3tag2Gy//j3PyYhtxzMgIwEVOJoSBo9SW7mpwX7cRc24eq1M=" }, "s3":{ "s3SchemaVersion":"1.0", "configurationId":"4e51601f-b26b-4b2f-9389-f39da91a1890", "bucket":{ "name":"cat-detector-img-repo", "ownerIdentity":{ "principalId":"A3W0C5E4PDB3VB" }, "arn":"arn:aws:s3:::cat-detector-img-repo" }, "object":{ "key":"cat1.jpeg", "size":12920, "eTag":"4a421caed9813b5b620f9e777a43caa8", "sequencer":"005A01C7B17DA1680E" } } } ] }';
        var filtered = lambda.filterEvents(JSON.parse(objectCreatedEvent));

        expect(filtered).to.have.lengthOf(1);
    });
    it('should reject delete event', function () {
        const objectCreatedEvent = '{ "Records":[ { "eventVersion":"2.0", "eventSource":"aws:s3", "awsRegion":"eu-west-1", "eventTime":"2017-11-07T14:48:17.640Z", "eventName":"ObjectRemoved:Delete", "userIdentity":{ "principalId":"AWS:AIDAIO4UECELEIKQL727W" }, "requestParameters":{ "sourceIPAddress":"64.236.4.1" }, "responseElements":{ "x-amz-request-id":"E9539EA0992FE185", "x-amz-id-2":"i9fnN8mAGRF/AR4TSV4hcCSWn0b3tag2Gy//j3PyYhtxzMgIwEVOJoSBo9SW7mpwX7cRc24eq1M=" }, "s3":{ "s3SchemaVersion":"1.0", "configurationId":"4e51601f-b26b-4b2f-9389-f39da91a1890", "bucket":{ "name":"cat-detector-img-repo", "ownerIdentity":{ "principalId":"A3W0C5E4PDB3VB" }, "arn":"arn:aws:s3:::cat-detector-img-repo" }, "object":{ "key":"cat1.jpeg", "size":12920, "eTag":"4a421caed9813b5b620f9e777a43caa8", "sequencer":"005A01C7B17DA1680E" } } } ] }';
        var filtered = lambda.filterEvents(JSON.parse(objectCreatedEvent));

        expect(filtered).to.be.empty;
    });
    it('should retrieve file name', function () {
        const objectCreatedEvent = '{ "Records":[ { "eventVersion":"2.0", "eventSource":"aws:s3", "awsRegion":"eu-west-1", "eventTime":"2017-11-07T14:48:17.640Z", "eventName":"ObjectCreated:Put", "userIdentity":{ "principalId":"AWS:AIDAIO4UECELEIKQL727W" }, "requestParameters":{ "sourceIPAddress":"64.236.4.1" }, "responseElements":{ "x-amz-request-id":"E9539EA0992FE185", "x-amz-id-2":"i9fnN8mAGRF/AR4TSV4hcCSWn0b3tag2Gy//j3PyYhtxzMgIwEVOJoSBo9SW7mpwX7cRc24eq1M=" }, "s3":{ "s3SchemaVersion":"1.0", "configurationId":"4e51601f-b26b-4b2f-9389-f39da91a1890", "bucket":{ "name":"cat-detector-img-repo", "ownerIdentity":{ "principalId":"A3W0C5E4PDB3VB" }, "arn":"arn:aws:s3:::cat-detector-img-repo" }, "object":{ "key":"cat1.jpeg", "size":12920, "eTag":"4a421caed9813b5b620f9e777a43caa8", "sequencer":"005A01C7B17DA1680E" } } } ] }';
        const fileAddedRecord = JSON.parse(objectCreatedEvent)[`Records`];

        var fileNames = lambda.recordsToFiles(fileAddedRecord);

        expect(fileNames).to.have.lengthOf(1);
        expect(fileNames[0]).to.equal('cat1.jpeg');
    });
    it("should rekognize a cat", function () {
        const rawLabels = {
            'Labels': [
                { 'Name': 'Animal', 'Confidence': 72.16043853759766 },
                { 'Name': 'Cat', 'Confidence': 72.16043853759766 },
                { 'Name': 'Pet', 'Confidence': 72.16043853759766 }
            ]
        };

        var isACat = recognition.isCatRecognized(rawLabels);

        expect(isACat).to.be.true;
    })
    it("should not rekognize a cat", function () {
        const rawLabels = {
            'Labels': [
                { 'Name': 'Animal', 'Confidence': 72.16043853759766 },
                { 'Name': 'Dog', 'Confidence': 72.16043853759766 },
                { 'Name': 'Pet', 'Confidence': 72.16043853759766 }
            ]
        };

        var isACat = recognition.isCatRecognized(rawLabels);

        expect(isACat).to.be.false;
    })
    it("should label an image", function () {
        const rawLabels = {
            'Labels': [
                { 'Name': 'Animal', 'Confidence': 72.16043853759766 },
                { 'Name': 'Dog', 'Confidence': 72.16043853759766 },
                { 'Name': 'Pet', 'Confidence': 72.16043853759766 }
            ]
        };

        var label = recognition.imageLabel(rawLabels);

        expect(label).to.equal('other');
    })
    it("should create data item", function () {
        var newFile = persistence.dbItem('file1', false, 'new');

        expect(newFile.Item.status).to.equal('new');
    })
});