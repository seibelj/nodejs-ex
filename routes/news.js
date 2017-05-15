var express = require('express');
var router = express.Router();
var Promise = require('bluebird');
var moment = require('moment');
var _ = require('lodash');
var he = require('he');

var rssParser = require('rss-parser');


var IS_FETCHING = false;
var LAST_NEWS_FETCH = null;
var NEWS = {};

var NEWS_CACHE_EXPIRES_SECONDS = 600;

// Get all plan and balance information of the user
router.get('/', function(req, res) {

    var now = moment().unix();
    if ((!LAST_NEWS_FETCH || (now - LAST_NEWS_FETCH) > NEWS_CACHE_EXPIRES_SECONDS) &&
        !IS_FETCHING) {

        IS_FETCHING = true;
        LAST_NEWS_FETCH = now;
        
        fetchNews().then(function() {
            IS_FETCHING = false;
            res.status(200).send(getRandomizedNews());
        
        }).catch(function(err) {
            console.error("Unable to fetch news", err);
            IS_FETCHING = false;
        });
        return;
    }
    else {
        res.status(200).send(getRandomizedNews());
    }
    
});

function getRandomizedNews() {
    var i;
    var randomNews = [];
    for (i = 0; i < NEWS.length; i++) {
        var tmp = _.shuffle(NEWS[i]).slice(0, 10);
        randomNews = _.concat(randomNews, tmp);
    }
    return _.shuffle(randomNews);
}

function fetchNews() {
    return Promise.all([
        fetchClickhole(),
        fetchBuzzfeed('LOL'),
        fetchBuzzfeed('QUIZ'),
        fetchBuzzfeed('OMG'),
        fetchTMZ(),
        fetch22words(),
        fetchFame10(),
        fetchViralThread(),
        fetchHuffPo()
    
    ]).then(function(values) {
        
        NEWS = values;

    }).catch(function(err) {
        console.error("Error fetching news", err);
    });
}

function fetchClickhole() {
    return new Promise(function(resolve, reject) {
        
        rssParser.parseURL('http://www.clickhole.com/feeds/rss', function(err, parsed) {

            if (err) {
                console.error("Unable to fetch clickhole", err);
                resolve([]);
                return;
            }

            var articles = [];
            parsed.feed.entries.forEach(function(entry) {
                articles.push({
                    title: entry.title,
                    description: entry.contentSnippet ? entry.contentSnippet : '',
                    link: entry.link,
                    provider: 'Clickhole',
                    icon: false,
                    guid: entry.guid
                });
            })
            resolve(articles);
        })
    });
}

function fetchBuzzfeed(type) {
    return new Promise(function(resolve, reject) {
        var url;
        switch(type) {
            case 'LOL':
                url = "https://www.buzzfeed.com/lol.xml";
                break;
            case 'OMG':
                url = "https://www.buzzfeed.com/omg.xml";
                break;
            case 'QUIZ':
                url = "https://www.buzzfeed.com/quiz.xml";
                break;
            default:
                break;
        }
        
        rssParser.parseURL(url, function(err, parsed) {

            if (err) {
                console.error("Unable to fetch buzzfeed", err);
                resolve([]);
                return;
            }

            var articles = [];
            parsed.feed.entries.forEach(function(entry) {
                articles.push({
                    title: entry.title,
                    description: he.decode(entry.contentSnippet.split("\n")[0]),
                    link: entry.link,
                    provider: 'Buzzfeed',
                    icon: false,
                    guid: entry.guid
                });
            })
            resolve(articles);
        })
    });
}

function fetchTMZ() {
    
    return new Promise(function(resolve, reject) {
        
        rssParser.parseURL('http://www.tmz.com/rss.xml', function(err, parsed) {

            if (err) {
                console.error("Unable to fetch TMZ", err);
                resolve([]);
                return;
            }

            var articles = [];
            parsed.feed.entries.forEach(function(entry) {
                articles.push({
                    title: entry.title,
                    description: he.decode(entry.contentSnippet.split("\n")[0]),
                    link: entry.link,
                    provider: 'TMZ',
                    icon: false,
                    guid: entry.guid
                });
            })
            resolve(articles);
        })
    });
}

function fetch22words() {
    
    return new Promise(function(resolve, reject) {
        
        rssParser.parseURL('http://twentytwowords.com/feed/', function(err, parsed) {

            if (err) {
                console.error("Unable to fetch 22words", err);
                resolve([]);
                return;
            }

            var articles = [];
            parsed.feed.entries.forEach(function(entry) {
                articles.push({
                    title: entry.title,
                    description: he.decode(entry.contentSnippet),
                    link: entry.link,
                    provider: '22 Words',
                    icon: false,
                    guid: entry.guid
                });
            })
            resolve(articles);
        })
    });
}

function fetchFame10() {

    return new Promise(function(resolve, reject) {
        
        rssParser.parseURL('http://www.fame10.com/feed/', function(err, parsed) {

            if (err) {
                console.error("Unable to fetch fame10", err);
                resolve([]);
                return;
            }

            var articles = [];
            parsed.feed.entries.forEach(function(entry) {
                articles.push({
                    title: entry.title,
                    description: he.decode(entry.contentSnippet),
                    link: entry.link,
                    provider: 'Fame10',
                    icon: false,
                    guid: entry.guid
                });
            })
            resolve(articles);
        })
    });
}

function fetchViralThread() {

    return new Promise(function(resolve, reject) {
        
        rssParser.parseURL('https://www.viralthread.com/feed/', function(err, parsed) {

            if (err) {
                console.error("Unable to fetch viral thread", err);
                resolve([]);
                return;
            }

            var articles = [];
            parsed.feed.entries.forEach(function(entry) {
                articles.push({
                    title: entry.title,
                    description: he.decode(entry.contentSnippet),
                    link: entry.link,
                    provider: 'Viral Thread',
                    icon: false,
                    guid: entry.guid
                });
            })
            resolve(articles);
        })
    });
}

function fetchHuffPo() {
    return new Promise(function(resolve, reject) {
        
        rssParser.parseURL('http://www.huffingtonpost.com/feeds/verticals/entertainment/index.xml', function(err, parsed) {

            if (err) {
                console.error("Unable to fetch huffpo", err);
                resolve([]);
                return;
            }

            var articles = [];
            parsed.feed.entries.forEach(function(entry) {
                articles.push({
                    title: entry.title,
                    description: he.decode(entry.contentSnippet.split("\n")[0]),
                    link: entry.link,
                    provider: 'Huffington Post',
                    icon: false,
                    guid: entry.guid
                });
            })
            resolve(articles);
        })
    });
}

module.exports = router;