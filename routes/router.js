var express = require('express'),
    follow = require('./follow/follow'),
    search = require('./search/search');

exports.app = express()
exports.app.get('/:id/followers', follow.getFollowers);
exports.app.get('/:id/following', follow.getFollowing);
exports.app.get('/search/users', search.getUsers);
exports.app.get('/search/photos', search.getPhotos);
exports.app.get('/search/interests', search.getInterests);
