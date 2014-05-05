var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');

var app = express();

var text_splitter = require('./text-splitter/text-splitter');
text_splitter.initialize('./text-splitter/cedict-data.txt');

app.use(bodyParser.json());

app.get('/', function(req, res) {
  res.redirect("http://www.zaoyin.eu/tools/text-splitter-api/");
});

app.post('/split', function(req, res) {
    if (req.body.charset === "simp" || req.body.charset === "trad") {
        res.send(JSON.stringify({result: "ok", split_text: text_splitter.split_string(req.body.text, req.body.charset)}) + '\n');
    } else {
        res.send(JSON.stringify({result: "error"}));
    }
});


module.exports = app;
