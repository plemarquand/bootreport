require('colors');
var say = require('say');
var weather = require('weather');
var fs = require('fs');
var path = require('path');
var handlebars = require('handlebars');
;var template = handlebars.compile(fs.readFileSync(path.join(__dirname, 'templates', 'weather.handlebars'), 'utf-8'));

var five = require("johnny-five"),
  board = new five.Board();

var WEATHER_API_KEY = "ZnfDV34F32Qh_qh3mNWg3fxU4m2MyFTDjYvKZwkC7W84iUZTgCjoNmOEum4arrPw";
var SPEAKING_VOICE = "Alex"; // TODO: Linux
var PROXIMITY_SENSOR_PIN = 10;

var lastrun = new Date().getTime();
var minInterval = 10000; // don't run a billion times in a row, rate limit it.

var report = function() {
  weather({
    location: "Toronto",
    logging: false,
    appid: WEATHER_API_KEY
  }, function(data) {

    var report = template(data);

    // output some text to the console as the callback
    say.speak(SPEAKING_VOICE, report, function() {
      console.log("text to speech complete".green);
    });

    console.log(report);
  });
};

// start listening to the board
board.on("ready", function() {
  this.pinMode(PROXIMITY_SENSOR_PIN, five.Pin.INPUT);

  this.digitalRead(PROXIMITY_SENSOR_PIN, function(value) {
    if (value === 0) {
      var currenttime = new Date().getTime();
      if (currenttime - lastrun > minInterval) {
        lastrun = currenttime;
        report();
      }
    }
  });
});