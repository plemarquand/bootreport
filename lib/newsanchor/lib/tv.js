var _ = require('underscore');
var moment = require('moment');
var fs = require('fs');
var path = require('path');
var say = require('say');
var Sickbeard = require('node-sickbeard');
var handlebars = require('handlebars');

module.exports = function(config) {
    if (!config) {
        throw new Error("Config object required");
    }

    if (!config.apikey) {
        throw new Error("API Key required for Sickbeard.");
    }

    if (!config.url) {
        throw new Error("Sickbeard URL required for TV report.");
    }

    var sb = new Sickbeard({
        url: config.url,
        apikey: config.apikey,
        debug: config.debug
    });

    var voice = config.voice || (process.platform == 'darwin' ? "Alex" : "");
    var dataDirectory = path.join(__dirname, 'data');
    var dateFilename = path.join(__dirname, 'data', 'lastSearchedDate.txt');
    var template = config.template || fs.readFileSync(path.join(dataDirectory, 'default_tv_template.handlebars'), 'utf-8');
    var notFoundTemplate = config.notFoundTemplate || fs.readFileSync(path.join(dataDirectory, 'no_new_tv_template.handlebars'), 'utf-8');

    handlebars.registerHelper("commaList", function(arr, options) {
        if (arr.length == 1) {
            return arr[0];
        } else {
            return _.first(arr, arr.length - 1).join(", ") + " and " + _.last(arr);
        }
    });

    // Given a list of shows, reduces the list to only the ones that were downloaded
    // after the supplied date.
    var filterDownloadedShows = function(shows, lastSearchedDate) {
        return _.filter(shows, function(show) {
            return show.status == "Downloaded" && moment(show.date).isAfter(lastSearchedDate);
        });
    };

    // Given a list of shows, reduces it to a hashmap where the key is the
    // name of the show and the value is an array of show objects.
    var getUniqueShows = function(shows) {
        return _.reduce(shows, function(memo, show) {
            if (!memo.hasOwnProperty(show.show_name)) {
                memo[show.show_name] = [];
            }
            memo[show.show_name].push(show);
            return memo;
        }, {});
    };

    // Given a show map, returns an array of strings formatted depending on
    // whether or not there are more than one in the value of the map.
    var buildShowNames = function(showMap) {
        return _.map(showMap, function(showCollection) {
            if (showCollection.length > 1) {
                return showCollection.length + " episodes of " + showCollection[0].show_name;
            } else {
                return showCollection[0].show_name;
            }
        });
    };

    // Builds a TV report against the supplied handlebars templates.
    var buildReport = function(shows) {
        var t = shows.length == 0 ? notFoundTemplate : template;
        return handlebars.compile(t)({
            shows: shows
        });
    };

    // Returns the last date/time a TV report was run.
    var getLastSearchDate = function() {
        var lastTimeString = fs.readFileSync(dateFilename, 'utf-8');
        return moment(config.test ? "Mar 9, 2014" : moment(lastTimeString));
    };

    // Saves the current date and time to the last run text file. Subsequent
    // searches will only return shows downloaded after this date.
    var saveSearchDate = function() {
        fs.writeFileSync(dateFilename, moment().toString());
    };

    var api = {
        report: function(callback) {
            callback = callback === undefined ? function() {} : callback;

            sb.cmd('history', {}).then(function(results) {
                var shows = buildShowNames(getUniqueShows(filterDownloadedShows(results.data, getLastSearchDate())));
                var report = buildReport(shows);

                console.log(report.cyan);

                // No use testing the verbal report in tests, or saving the last date.
                if (config.test === true) {
                    callback(null, report);
                    return;
                }

                saveSearchDate();

                say.speak(voice, report, function() {
                    console.log("Weather report complete".green);
                    callback(null, report);
                });
            }).
            catch (callback).done();
        }
    };

    if (config.test) {
        // Add the testing API only if we're configured for testing.
        api.test = {
            buildReport: buildReport,
            filterDownloadedShows: filterDownloadedShows,
            getUniqueShows: getUniqueShows,
            buildShowNames: buildShowNames
        };
    }
    return api;
};