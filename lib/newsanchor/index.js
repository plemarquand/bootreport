var Weather = require('./lib/weather.js');
var TV = require('./lib/tv.js');

module.exports = (function() {
    return {
        Weather: Weather,
        TV: TV
    };
})();