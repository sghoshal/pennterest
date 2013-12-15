
var MongoClient = require('mongodb').MongoClient;
var Db = require('mongodb').Db,
Server = require('mongodb').Server,
ReplSetServers = require('mongodb').ReplSetServers,
ObjectID = require('mongodb').ObjectID,
Binary = require('mongodb').Binary,
GridStore = require('mongodb').GridStore,
Grid = require('mongodb').Grid,
Code = require('mongodb').Code,
BSON = require('mongodb').pure().BSON,
assert = require('assert');
var MongoDB = require('mongodb');
var fs = require('fs');
var http = require('http');

var request = require('request');

var connectData = { 
		"hostname": "cis550project.c2vffmuf4yhs.us-east-1.rds.amazonaws.com", 
		"user": "CIS550", 
		"password": "databaseproject", 
		"database": "CIS550" };
var oracle =  require("oracle");

function query_db(req, res, query_id) {
	oracle.connect(connectData, function (err, connection) {
        
        var sql_get_pin = 
            "select distinct p.photoid AS PID, p.is_cached, p.url AS URL, p.avg_rating AS AVG, p.pin_count AS COUNT " +
            "from photo p, pin pi " +
            "where pi.photoid = p.photoid and pi.userid='" + query_id + "' " 
            "order by p.photoid";

		if (err) {
			console.log("Error in query: "+err);
		} else {
			connection.execute(sql_get_pin, [], 
				function (err, results) {
					if (err) {
						console.log("Error after executing the first query: "+err);
					} else {
						connection.close();

						console.log("Size of the results of first query: "+results.length)
						for (var i = 0; i < results.length; i++)
							console.log ("PHOTOID: " + results[i]["PID"] +
                                         " IS_CACHED: " + results[i]["IS_CACHED"] +
                                         " URL:" + results[i]["URL"] );
						output_pins(req, res, results);
					}	
				}
			);	
		}
	});
}

function output_pins (req, res, results) {

    res.render('pins.jade', 
                {"title": "Pins of " + req.query.id, 
                 "queried_userid": req.query.id,
                 "session_userid": req.session.userid,
                 "results": results});
}

function load_error_page(req, res) {
    res.render('error.jade');
}


function redirect_to_login(req, res){

  console.log("Session started. Redirecting user to home page");
  res.writeHead(301, {Location: '/'});
  res.end();
}


exports.get_user_pins = function(req, res) {

	console.log("IN PINS PAGE...");
	console.log("Session Authenticated: " + req.session.userAuthenticated);
    console.log("User ID Queried " + req.query.id);
    console.log("Session User ID: "  + req.session.userid);

	if (req.session.userAuthenticated) {
        query_db(req, res, req.query.id);
    }
	else 
        redirect_to_login(req, res);
};
