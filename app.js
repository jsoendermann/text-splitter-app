/*global require, module, console */
'use strict';

var express = require('express');
var bodyParser = require('body-parser');
var monk = require('monk');
var text_splitter = require('./text-splitter/text-splitter');


var app = express();

// Initializations
console.log('Connecting to db');
var db = monk('localhost:27017/zh_api');
console.log('Initializing text splitter DMA');
text_splitter.initialize('./text-splitter/cedict-data.txt');


// Initialize plugins
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(bodyParser.json());
app.use(function(req, res, next) {
    req.db = db;
    next();
});

console.log('Done initializing');

// Route handlers
app.get('/', function(req, res) {
    res.render('index', {title: 'Home'});
});

app.post('/split', function(req, res) {
    var text = req.body.text;
    var charset = req.body.charset;

    if (charset === "simp" || charset === "trad") {
        var output = JSON.stringify(
            {
                result:     "ok", 
                split_text: text_splitter.split_string(text, charset)
            }) + '\n';

        res.send(output);
    } else {
        res.send(JSON.stringify({result: "error"}) + '\n');
    }
});

app.post('/cedict', function(req, res) {
    var word = req.body.word;
    var charset = req.body.charset;

    if (typeof word !== 'undefined' && (charset === 'simp' || charset === 'trad')) {
        var collection = req.db.get('cedict');
        var query = {};
        query[charset] = word;

        collection.find(query).on('success', function (doc) {
            // remove mongodb _id field from objects
            doc.forEach(function(entry) { delete entry._id; });

            res.send(JSON.stringify({result: 'ok', records: doc}) + '\n');
        }).on('failure', function() {
            res.send(JSON.stringify({result: 'error'}) + '\n');
        });
    } else {
        res.send(JSON.stringify({result: 'error'}) + '\n');
    }
});


module.exports = app;
