var express = require('express'),
    http = require('http'),
    path = require('path'),
    router = require('./routes/router');

var app = router.app;

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

app.use(express.static(__dirname + '/public'));

http.createServer(app).listen(9000);
