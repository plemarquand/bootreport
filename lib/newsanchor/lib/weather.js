var fs = require('fs');
var path = require('path');
var say = require('say');
var weather = require('weather');
var handlebars = require('handlebars');

module.exports = function(config) {
    if (!config) {
        throw new Error("Config object required");
    }

    if (!config.apikey) {
        throw new Error("API Key required for Yahoo! Weather service.");
    }

    if (!config.location) {
        throw new Error("Location required for weather report.");
    }

    var voice = config.voice || (process.platform == 'darwin' ? "Alex" : "");
    var template = config.template || fs.readFileSync(path.join(__dirname, 'data', 'default_weather_template.handlebars'), 'utf-8');

    return {
        report: function(callback) {
            weather({
                location: config.location,
                logging: config.debug,
                appid: config.apikey
            }, function(data) {

                var report = handlebars.compile(template)(data);
                console.log(report.cyan);

                // No use testing the verbal report in tests.
                if (config.test) {
                    if (callback) {
                        callback(null, report);
                    }
                    return;
                }

                say.speak(voice, report, function() {
                    console.log("text to speech complete".green);
                    if (callback) {
                        callback(null, report);
                    }
                });
            });
        }
    }
};