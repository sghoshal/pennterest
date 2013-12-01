var express = require('express'),
    query = require('./query.js');

exports.app = express()
exports.app.get('/:id/followers', query.load);

