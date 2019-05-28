var chai = require('chai'),
    expect = chai.expect,
    should = chai.should();
var sinon = require('sinon');

const lambda = require("../src/upload.js");
const CORS_HEADERS = { 'Access-Control-Allow-Origin': '*' };

describe('Test upload', function () {
    it('accepts valid http event', function () {
        const expectedContentType = "application/json; charset=utf-8";
        const validEvent = {
            headers: {'content-type': expectedContentType},
            body: '{"name":"cat3.jpg","type":"image/jpeg"}'
        };
        const successCb = sinon.spy(); 
        const errorCb = sinon.spy(); 
        
        lambda.validateInput(validEvent, successCb, errorCb);

        expect(successCb.calledOnce).to.be.true;
        expect(errorCb.notCalled).to.be.true;
    });
    it('reject invalid content type', function () {
        const event = {
            headers: {'content-type': "image/png"},
            body: '{"name":"cat3.jpg","type":"image/jpeg"}',
        };
        const successCb = sinon.spy(); 
        const errorCb = sinon.spy(); 
        
        lambda.validateInput(event, successCb, errorCb);
        
        expect(errorCb.calledOnce).to.be.true;
        expect(successCb.notCalled).to.be.true;
    });
    it('reject request without type param', function () {
        const event = {
            headers: {'content-type': "application/json"},
            body: '{"name": "hellokitty.jpg"}'
        };
        const successCb = sinon.spy(); 
        const errorCb = sinon.spy(); 
        
        lambda.validateInput(event, successCb, errorCb);
        
        expect(errorCb.calledOnce).to.be.true;
        expect(successCb.notCalled).to.be.true;
    });
    it('rejects request without name param', function () {
        const event = {
            headers: {'content-type': "application/json"},
            body: '{"type": "hellokitty.jpg"}'
        };
        const successCb = sinon.spy(); 
        const errorCb = sinon.spy(); 
        
        lambda.validateInput(event, successCb, errorCb);
        
        expect(errorCb.calledOnce).to.be.true;
        expect(successCb.notCalled).to.be.true;
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
            const successCb = sinon.spy(); 
            const errorCb = sinon.spy(); 
            
            lambda.validateInput(event, successCb, errorCb);
            
            expect(successCb.calledOnce).to.be.true;
            expect(errorCb.notCalled).to.be.true;
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
            const successCb = sinon.spy(); 
            const errorCb = sinon.spy(); 

            lambda.validateInput(event, successCb, errorCb);
            
            expect(errorCb.calledOnce).to.be.true;
            expect(successCb.notCalled).to.be.true;
        });
    });
});