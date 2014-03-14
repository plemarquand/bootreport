/*jshint expr: true*/

var chai = require('chai');
var assert = chai.assert;
var expect = chai.expect;
var should = chai.should();

var moment = require('moment');
var timecop = require('..');

describe('timecop', function() {
    it('should return true if a date is within the valid range', function() {
        var dateValidator = timecop(moment([2010, 1, 14, 6]), moment([2010, 1, 14, 9]));
        var result = dateValidator.validate(moment([2010, 1, 14, 8]));
        expect(result).to.be.true;
    });

    it('should return false if a date is outside the valid range', function() {
        var dateValidator = timecop(moment([2010, 1, 14, 6]), moment([2010, 1, 14, 9]));
        var result = dateValidator.validate(moment([2010, 1, 14, 10]));
        expect(result).to.be.false;
    });

    it('should return true if a date is within the valid range hourly', function() {
        var dateValidator = timecop(6, 9);
        var result = dateValidator.validate(moment().hour(8).minute(0).second(0));
        expect(result).to.be.true;
    });

    it('should return false if a date is outside the valid range hourly', function() {
        var dateValidator = timecop(6, 9);
        var result = dateValidator.validate(moment().hour(10).minute(0).second(0));
        expect(result).to.be.false;
    });
});