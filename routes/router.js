var express = require('express'),
    followers = require('./followers'),
    search = require('./search');

exports.app = express()
exports.app.get('/:id/followers', followers.get);
exports.app.get('/search', search.get);
