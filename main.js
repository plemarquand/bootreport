require('colors');
var moment = require('moment');
var anchors = require('./lib/newsanchor');
var debouncer = require('./lib/debouncer');
var validator = require('./lib/timecop');

var dotenv = require('dotenv');
dotenv.load();

var voice = process.env.VOICE || (process.platform == 'darwin' ? 'Daniel Compact' : '');
var PROXIMITY_SENSOR_PIN = process.env.PROXIMITY_SENSOR_PIN || 10;

var weatherValidator = validator(6, 9);
var weatherAnchor = new anchors.Weather({
    location: process.env.WEATHER_LOCATION,
    apikey: process.env.WEATHER_KEY,
    debug: process.env.DEBUG,
    voice: voice
});

var tvValidator = validator(16, 22);
var tvAnchor = new anchors.TV({
    url: (process.platform == 'darwin' ? '192.168.0.109:8081' : 'localhost:8081'),
    apikey: process.env.SICKBEARD_KEY,
    debug: process.env.DEBUG,
    voice: voice,
});

var bouncer = debouncer(function(value) {
    var now = moment();

    // Leaving in the morning, we get 1
    if (value === 1 && weatherValidator.validate(now)) {
        weatherAnchor.report();
    } else if (value === 0 && tvValidator.validate(now)) {
        tvAnchor.report();
    }
}, 500);

var now = moment();

// Leaving in the morning, we get 1
// if (value === 1 && weatherValidator.validate(now)) {
    weatherAnchor.report();
// } else if (value === 0 && tvValidator.validate(now)) {
    // tvAnchor.report();
// }

// var five = require("johnny-five"),
//     board = new five.Board();

// board.on("ready", function() {
//     this.pinMode(PROXIMITY_SENSOR_PIN, five.Pin.INPUT);
//     this.digitalRead(PROXIMITY_SENSOR_PIN, bouncer.process);
// });