'use strict';
var moment = require('moment');

module.exports = function(startDate, endDate) {
    function isNumber(n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    };

    var validate = function(date) {
        var testDate = moment(date);
        var start = isNumber(startDate) ? moment().hour(startDate).minute(0).second(0) : startDate;
        var end = isNumber(endDate) ? moment().hour(endDate).minute(0).second(0) : endDate;
        return testDate.isAfter(start) && testDate.isBefore(end);
    };

    return {
        validate: validate
    };
};