var express = require('express')
  , signup = require('./signup')
  ;

var app = express();

app.post('/signup', signup.do_work);

exports.do_work = function(req, res){
	res.render('signupdetails.jade');
};