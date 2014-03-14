/*jshint expr: true*/

var moment = require('moment');
var chai = require('chai');
var assert = chai.assert;
var expect = chai.expect;
var should = chai.should();
var newsanchor = require('..');

describe('News Anchors', function() {
    it('should have a weather anchor', function() {
        expect(newsanchor.Weather).to.be.ok;
    });

    it('should have a tv anchor', function() {
        expect(newsanchor.TV).to.be.ok;
    });

    describe('Weather Man', function() {
        it('should report an error when the config is missing', function() {
            expect(function() {
                new newsanchor.Weather();
            }).to.
            throw (Error);
        });

        it('should report an error when location is missing from the config', function() {
            expect(function() {
                new newsanchor.Weather({
                    apikey: "xxx"
                });
            }).to.
            throw (Error);
        });

        it('should report an error when the apikey is missing from the config', function() {
            expect(function() {
                new newsanchor.Weather({
                    location: "xxx"
                });
            }).to.
            throw (Error);
        });

        it('should report the weather', function(done) {
            var weatherAnchor = new newsanchor.Weather({
                location: "Toronto",
                apikey: "ZnfDV34F32Qh_qh3mNWg3fxU4m2MyFTDjYvKZwkC7W84iUZTgCjoNmOEum4arrPw",
                voice: "",
                test: true
            });

            weatherAnchor.report(done);
        });
    });

    describe("TV Man", function() {
        var getAnchor = function() {
            return new newsanchor.TV({
                url: "xxx",
                apikey: "xxx",
                test: true
            });
        };

        it('should report an error when the config is missing', function() {
            expect(function() {
                new newsanchor.TV();
            }).to.
            throw (Error);
        });

        it('should report an error when location is missing from the config', function() {
            expect(function() {
                new newsanchor.TV({
                    apikey: "xxx"
                });
            }).to.
            throw (Error);
        });

        it('should report an error when the apikey is missing from the config', function() {
            expect(function() {
                new newsanchor.TV({
                    url: "xxx"
                });
            }).to.
            throw (Error);
        });

        describe('internals', function() {
            it('should render a default empty template for no shows', function() {
                var anchor = getAnchor();
                var shows = [];
                var results = anchor.test.buildReport(shows);
                expect(results).to.equal("No new shows right now, sorry human.");
            });

            it('should render a show list into a handlebar template', function() {
                var anchor = getAnchor();
                var shows = ["Batman", "Girls", "Boys"];
                var results = anchor.test.buildReport(shows);
                expect(results).to.equal("Dude, you got shows to watch... I downloaded Batman, Girls and Boys. Enjoy.");
            });

            it('should filter a list of shows down to only the ones that were downloaded', function() {
                var anchor = getAnchor();
                var shows = [{
                    date: moment(),
                    status: "Incomplete"
                }, {
                    name: "winner",
                    date: moment(),
                    status: "Downloaded"
                }, {
                    date: moment().subtract('days', 10),
                    status: "Downloaded"
                }];

                var results = anchor.test.filterDownloadedShows(shows, moment().subtract('days', 1));
                expect(results).to.have.length(1);
            });

            it('should create a mapping of shows where there are multiple shows of the same name', function() {
                var anchor = getAnchor();
                var shows = [{
                    show_name: "Girls"
                }, {
                    show_name: "Girls"
                }, {
                    show_name: "Boys"
                }];
                var map = anchor.test.getUniqueShows(shows);
                expect(map.Girls).to.have.length(2);
                expect(map.Boys).to.have.length(1);
            });

            it('should build show names', function() {
                var anchor = getAnchor();
                var shows = [{
                    show_name: "Girls"
                }, {
                    show_name: "Girls"
                }, {
                    show_name: "Boys"
                }];
                var names = anchor.test.buildShowNames(anchor.test.getUniqueShows(shows));
                expect(names[0]).to.equal("2 episodes of Girls");
                expect(names[1]).to.equal("Boys");
            });
        });

    });
});