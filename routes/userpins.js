/**
 * 
 */

var connectData = { 
  "hostname": "cis550project.c2vffmuf4yhs.us-east-1.rds.amazonaws.com", 
  "user": "CIS550", 
  "password": "databaseproject", 
  "database": "CIS550" };
var oracle =  require("oracle");

function query_db(res, fName, lName) {
	oracle.connect(connectData, function (err, connection) {
		var sqlGetPins = 
			"SELECT P.PHOTOID, PH.URL " +
			"FROM USERS U, BOARD B, PIN P, PHOTO PH " +
			"WHERE U.USERID=B.USERID AND B.BOARDID=P.BOARDID " +
					"AND P.PHOTOID=PH.PHOTOID AND " +
					"U.USERID=101";
		
		if (err) {
			console.log(err);
		} else {
			connection.execute(sqlGetPins, [], 
				function (err, results) {
					if (err) {
						console.log(err);
					} else {
						connection.close();
						for (var i = 0; i < results.length; i++)
							console.log ("USER: " + results[i]);
							output_pins(res, fName, lName, results);
					}	
				}
			);
		}
	});
}

function output_pins (res, fName, lName, results) {
	res.render('userpins.jade', 
			{title: "Pins of " + fName + " " + lName, 
			 results: results});
}

exports.pins = function(req, res){
	console.log ("First Name: " + req.query.firstName);
	console.log ("Last Name: " + req.query.lastName);
	query_db(res, req.query.firstName, req.query.lastName);
};

