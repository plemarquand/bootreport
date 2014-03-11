require('colors');
var say = require('say');
var weather = require('weather');
var fs = require('fs');
var path = require('path');
var handlebars = require('handlebars');
var template = handlebars.compile(fs.readFileSync(path.join(__dirname, 'templates', 'weather.handlebars'), 'utf-8'));
var moment = require('moment');

var WEATHER_API_KEY = "ZnfDV34F32Qh_qh3mNWg3fxU4m2MyFTDjYvKZwkC7W84iUZTgCjoNmOEum4arrPw";
var SPEAKING_VOICE = "Alex"; // TODO: Linux
var PROXIMITY_SENSOR_PIN = 10;

var lastrun = new Date().getTime();
var minInterval = 10000; // don't run a billion times in a row, rate limit it.

var weatherReport = function(callback) {
    weather({
        location: "Toronto",
        logging: false,
        appid: WEATHER_API_KEY
    }, function(data) {

        var report = template(data);

        // output some text to the console as the callback
        say.speak(SPEAKING_VOICE, report, function() {
            console.log("text to speech complete".green);
            if (callback) {
                callback(null);
            }
        });

        console.log(report.cyan);
    });
};

var tvReport = function(callback) {
    var _ = require('underscore');
    var moment = require('moment');
    var fs = require('fs');
    var path = require('path');
    var Sickbeard = require('node-sickbeard');
    var url;

    if (process.platform == 'darwin') {
        url = '192.168.0.109:8081';
    } else if (process.platform == 'linux') {
        url = 'localhost:8081';
    }

    var sb = new Sickbeard({
        url: url,
        apikey: process.argv[2],
        debug: false
    });

    var dateFilename = path.join(__dirname, 'lastSearchedDate.txt');
    var lastTimeString = fs.readFileSync(dateFilename, 'utf-8');
    var lastSearchedDate = moment("Mar 9, 2014"); // moment(lastTimeString);

    sb.cmd('history', {}).then(function(results) {
        var data = results.data;

        var downloaded = _.filter(data, function(show) {
            return show.status == "Downloaded" && moment(show.date).isAfter(lastSearchedDate);
        });

        var showMap = _.reduce(downloaded, function(memo, show) {
            if (!memo.hasOwnProperty(show.show_name)) {
                memo[show.show_name] = [];
            }
            memo[show.show_name].push(show);
            return memo;
        }, {});

        var results = _.map(showMap, function(showCollection) {
            if (showCollection.length > 1) {
                return showCollection.length + " episodes of " + showCollection[0].show_name;
            } else {
                return showCollection[0].show_name;
            }
        });
        fs.writeFileSync(dateFilename, moment().toString());

        var report = "";
        if (results.length == 0) {
            report = report + "No new shows today, sorry human.";
        } else {
            report = report + "Dude, you got shows to watch... I downloaded ";
        }

        if (results.length > 1) {
            results.splice(results.length - 1, 0, "and");
        }

        var report = report + results.join(", ");
        if (results.length > 0) {
            report = report + ". Enjoy.";
        }

        console.log(report.cyan);

        say.speak(SPEAKING_VOICE, report, function() {
            console.log("text to speech complete".green);
            if (callback) {
                callback(null);
            }
        });
    }).
    catch (function(err) {
        if (callback) {
            callback(err);
        }
    }).done();
};


var five = require("johnny-five"),
    board = new five.Board();

// start listening to the board
board.on("ready", function() {
    this.pinMode(PROXIMITY_SENSOR_PIN, five.Pin.INPUT);

    var weatherStartDate = moment().hour(8).minute(0).second(0);
    var weatherEndDate = moment().hour(11).minute(0).second(0);

    var tvStartDate = moment().hour(16).minute(0).second(0);
    var tvEndDate = moment().hour(19).minute(30).second(0);

    var currentValue = -1;

    var settled = function(value) {
        if (value === currentValue) {
            return;
        }

        currentValue = value;
        console.log("SETTLED ON", value);
        var now = moment();
        if (value === 0 && now.isAfter(weatherStartDate) && now.isBefore(weatherEndDate)) {
            var currenttime = new Date().getTime();
            if (currenttime - lastrun > minInterval) {
                lastrun = currenttime;
                weatherReport();
            }
        } else if (value === 1 && now.isAfter(tvStartDate) && now.isBefore(tvEndDate)) {
            var currenttime = new Date().getTime();
            if (currenttime - lastrun > minInterval) {
                lastrun = currenttime;
                tvReport();
            }
        }
    }

    var settleDuration = 500;
    var timeout = -1;
    var activeValue = -1;
    this.digitalRead(PROXIMITY_SENSOR_PIN, function(value) {
        clearTimeout(timeout);
        timeout = setTimeout(settled, settleDuration, value);
    });
});