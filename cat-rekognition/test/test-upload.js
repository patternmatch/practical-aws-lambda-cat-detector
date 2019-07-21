var chai = require('chai'),
    expect = chai.expect;

const lambda = require("../src/upload.js");

describe('Test upload', function () {
    it('accepts valid http event', function () {
        const expectedContentType = "application/json; charset=utf-8";
        const validEvent = {
            headers: {'content-type': expectedContentType},
            body: '{"name":"cat3.jpg","type":"image/jpeg"}'
        };

        expect(lambda.validateInput(validEvent).valid).to.be.true;
    });
    it('reject invalid content type', function () {
        const event = {
            headers: {'content-type': "image/png"},
            body: '{"name":"cat3.jpg","type":"image/jpeg"}',
        };
        
        expect(lambda.validateInput(event).valid).to.be.false;
    });
    it('reject request without type param', function () {
        const event = {
            headers: {'content-type': "application/json"},
            body: '{"name": "hellokitty.jpg"}'
        };

        expect(lambda.validateInput(event).valid).to.be.false;
    });
    it('rejects request without name param', function () {
        const event = {
            headers: {'content-type': "application/json"},
            body: '{"type": "hellokitty.jpg"}'
        };
        
        expect(lambda.validateInput(event).valid).to.be.false;
    });
    it('accepts image file types', function () {
        const AllowedTypes = [
            "image/jpeg",
            "image/gif",
            "image/png"
        ];
        
        AllowedTypes.forEach((item, index, arr) => {
            const event = { 
                headers: {'content-type': "application/json"},
                body: '{"type": "'+ item +'", "name": "bobcat"}'
            };

            expect(lambda.validateInput(event).valid).to.be.true;
        });
    });
    it('rejects non-image file types', function () {
        const NotAllowedTypes = [
            "application/json",
            "application/pdf"
        ];

        NotAllowedTypes.forEach((item, index, arr) => {
            const event = { 
                headers: {'content-type': "application/json"},
                body: '{"type": "'+ item +'", "name": "bobcat"}'
            };
            expect(lambda.validateInput(event).valid).to.be.false;
        });
    });
});