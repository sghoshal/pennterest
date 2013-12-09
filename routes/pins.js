var connectData = { 
		"hostname": "cis550project.c2vffmuf4yhs.us-east-1.rds.amazonaws.com", 
		"user": "CIS550", 
		"password": "databaseproject", 
		"database": "CIS550" };
var oracle =  require("oracle");

function query_db(req, res) {
	oracle.connect(connectData, function (err, connection) {
		var sqlGetPins =
			"select distinct p.photoid AS PID, p.url AS URL, p.avg_rating AS AVG, p.pin_count AS COUNT " +
			"from photo p, pin pi " +
			"where pi.photoid = p.photoid and pi.userid='" + req.query.id + "' " 
			"order by p.photoid";
		
		if (err) {
			console.log("Error in query: "+err);
		} else {
			connection.execute(sqlGetPins, [], 
				function (err, results) {
					if (err) {
						console.log("Error after executing the first query: "+err);
					} else {
						connection.close();
						console.log("Size of the results of first query: "+results.length)
						output_pins(req, res, results);
					}	
				}
			);	
		}
	});
}

function output_pins (req, res, results) {
	res.render('pins.jade', 
			{title: "Pins of " + req.query.id, 
			 results: results,
			 queried_userid: req.query.id,
			 session_userid: req.session.userid});
}

function load_error_page(req, res) {
    res.render('error.jade');
}

function redirect_to_login(req, res){

  console.log("Session started. Redirecting user to home page");
  res.writeHead(301, {Location: '/'});
  res.end();
}

exports.get_user_pins = function(req, res){

	console.log("IN PINS PAGE...");
	console.log("Session Authenticated: " + req.session.userAuthenticated);
    console.log("User ID Queried " + req.query.id);
    console.log("Session User ID: "  + req.session.userid);
	
	if (req.session.userAuthenticated)
		query_db(req, res, req.query.id);
	else
		redirect_to_login(req, res);
};

