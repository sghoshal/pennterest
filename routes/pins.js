
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
		/*var sqlGetPins = 
			"SELECT P.PHOTOID, PH.URL " +
			"FROM USERS U, BOARD B, PIN P, PHOTO PH " +
			"WHERE U.USERID=B.USERID AND B.BOARDID=P.BOARDID " +
					"AND P.PHOTOID=PH.PHOTOID AND " +
					"U.USERID=" + query_id;
        */

        var sql_get_pin = 
            "SELECT DISTINCT PHOTOID, PH.URL, PH.IS_CACHED " + 
            "FROM PIN P NATURAL JOIN PHOTO PH " +
            "WHERE P.USERID=" + query_id;
		
		if (err) {
			console.log(err);
		} else {
			connection.execute(sql_get_pin, [], 
				function (err, results) {
					if (err) {
						console.log(err);
					} else {
						connection.close();
						for (var i = 0; i < results.length; i++)
							console.log ("PHOTOID: " + results[i]["PHOTOID"] +
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
    res.render('pins_container.jade', 
                {"title": "Pins of " + req.query.id, 
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
