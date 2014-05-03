var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var app = express();

var text_splitter = require('./text-splitter/text-splitter');
text_splitter.initialize('./text-splitter/cedict-data.txt');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');


app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});
app.post('/split', function(req, res) {
    if (req.body.charset === "trad") {
        res.send(JSON.stringify({result: "ok", split_text: text_splitter.split_trad_string(req.body.text)}) + '\n');
    } else {
        res.send(JSON.stringify({error: "error"}));
    }
});


module.exports = app;
