/*jshint expr: true*/

var chai = require('chai');
var assert = chai.assert;
var expect = chai.expect;
var should = chai.should();

var debouncer = require('..');

describe('debouncer', function() {
    it('should require a callback for when the method debounces', function() {
        expect(function() {
            debouncer();
        }).to.
        throw (Error);
    });

    it('should have a process method', function() {
        expect(debouncer(function() {}).process).to.be.ok;
    });
});