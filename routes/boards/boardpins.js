// Connect string to Oracle
var connectData = { 
  "hostname": "cis550project.c2vffmuf4yhs.us-east-1.rds.amazonaws.com", 
  "user": "CIS550", 
  "password": "databaseproject", 
  "database": "CIS550" };
var oracle =  require("oracle");

function query_db(req, res) {
	oracle.connect(connectData, function (err, connection) {
		var sqlGetBoardPins =
			"select p.photoid AS PID, p.url AS URL, p.avg_rating AS AVG, p.pin_count AS COUNT " +
			"from photo p, pin pi " +
			"where pi.photoid = p.photoid and pi.boardid=" + req.query.bid + " " 
			"order by p.photoid";
		
		if (err) {
			console.log("Error in query: "+err);
		} else {
			connection.execute(sqlGetBoardPins, [], 
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

/*
Given a set of query results, output a table

res = HTTP result object sent back to the client
name = Name to query for
results = List object of query results */
function output_pins(req, res,results) {
	res.render('boardpins.jade',
		   { title: "Pins of Board " + req.query.bid,
		     results: results,
		     session_userid: req.session.userid,
		     queried_userid: req.query.id,
		     queried_boardid: req.query.bid }
	  );
}

function redirect_to_login(req, res){
  console.log("Session started. Redirecting user to home page");
  res.writeHead(301, {Location: '/'});
  res.end();
}

function load_error_page(req, res) {
    res.render('error.jade');
}


/*This is what's called by the main app */
exports.do_work = function(req, res){
	console.log("IN BOARDS PINS PAGE...");
	console.log("Session Authenticated: " + req.session.userAuthenticated);
    //console.log("User ID Queried " + req.query.id);
    //console.log("Session User ID: "  + req.session.userid);
	
	if (req.session.userAuthenticated)
		query_db(req, res);
	else
		redirect_to_login(req, res);
};
