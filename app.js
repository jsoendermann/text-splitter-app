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
    var text, charset, output;

    text = req.body.text;
    charset = req.body.charset;

    if (charset === 'simp' || charset === 'trad') {
        output = JSON.stringify(
            {
                result:     'ok', 
                split_text: text_splitter.split_string(text, charset)
            }) + '\n';

        res.send(output);
    } else {
        res.send(JSON.stringify({result: 'error', reason: 'Invalid input'}) + '\n');
    }
});

app.post('/cedict', function(req, res) {
    var word, charset, collection, query;

    word = req.body.word;
    charset = req.body.charset;

    if (typeof word !== 'undefined' && (charset === 'simp' || charset === 'trad')) {
        collection = req.db.get('cedict');
        query = {};
        query[charset] = word;

        collection.find(query).on('success', function (doc) {
            // remove mongodb _id field from objects
            doc.forEach(function(entry) { delete entry._id; });

            res.send(JSON.stringify({result: 'ok', records: doc}) + '\n');
        }).on('failure', function() {
            res.send(JSON.stringify({result: 'error', reason: 'DB error'}) + '\n');
        });
    } else {
        res.send(JSON.stringify({result: 'error', reason: 'Invalid input'}) + '\n');
    }
});

app.post('/charset-conversion', function(req, res) {
    var text, charset, target_charset, split_text, collection, converted_array, convert_word, current_word, query;
    
    text = req.body.text;
    charset = req.body.charset;
    
    if (typeof text !== 'undefined' && (charset === 'simp' || charset === 'trad')) {
        if (charset === 'simp') {
            target_charset = 'trad';
        } else {
            target_charset = 'simp';
        }

        split_text = text_splitter.split_string(text, charset);
        collection = req.db.get('cedict');
        converted_array = [];

        convert_word = function (index) {
            if (index >= split_text.length) {
                res.send(JSON.stringify({result: 'ok', 
                                         converted_text: converted_array.join('')}) + '\n');
            } else {
                current_word = split_text[index];
                query = {};
                query[charset] = current_word;

                collection.find(query).on('success', function (doc) {
                    if (doc.length > 0) {
                        converted_array[index] = doc[0][target_charset];
                    } else {
                        converted_array[index] = current_word;
                    }
                    convert_word(index + 1);
                }).on('failure', function() {
                    res.send(JSON.stringify({result: 'error', reason: 'DB error'}) + '\n');
                });
            }
        };
        convert_word(0);
    } else {
        res.send(JSON.stringify({result: 'error', reason: 'Invalid input'}) + '\n');
    }
});


module.exports = app;
