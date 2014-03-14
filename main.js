require('colors');
var moment = require('moment');
var anchors = require('./lib/newsanchor');
var debouncer = require('./lib/debouncer');
var validator = require('./lib/timecop');

var SPEAKING_VOICE = (process.platform == 'darwin' ? 'Alex' : '');
var PROXIMITY_SENSOR_PIN = 10;

var weatherValidator = validator(6, 9);
var weatherAnchor = new anchors.Weather({
    location: "Toronto",
    apikey: "ZnfDV34F32Qh_qh3mNWg3fxU4m2MyFTDjYvKZwkC7W84iUZTgCjoNmOEum4arrPw",
    voice: SPEAKING_VOICE,
    debug: false,
});

var tvValidator = validator(16, 22);
var tvAnchor = new anchors.TV({
    url: (process.platform == 'darwin' ? '192.168.0.109:8081' : 'localhost:8081'),
    apikey: process.argv[2],
    voice: SPEAKING_VOICE,
    debug: false
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

var five = require("johnny-five"),
    board = new five.Board();

board.on("ready", function() {
    this.pinMode(PROXIMITY_SENSOR_PIN, five.Pin.INPUT);
    this.digitalRead(PROXIMITY_SENSOR_PIN, bouncer.process);
});