var connectData = { 
		"hostname": "cis550project.c2vffmuf4yhs.us-east-1.rds.amazonaws.com", 
		"user": "CIS550", 
		"password": "databaseproject", 
		"database": "CIS550" };
var oracle =  require("oracle");

function query_db(req, res) {
	oracle.connect(connectData, function (err, connection) {
		console.log("uid: "+req.session.userid);
		var sqlGetBoards =
			"select B.BOARDID, B.BOARDNAME " +
			"from BOARD B " +
			"where B.USERID=" + req.session.userid;		
		if (err) {
			console.log("Error in query: "+err);
		} else {
			connection.execute(sqlGetBoards, [], 
				function (err, results) {
					if (err) {
						console.log("Error after executing the boards query: "+err);
					} else {
						connection.close();
						console.log("Total number of Boards I own is: "+results.length)
						output_boards(req, res, results);
					}	
				}
			);	
		}
	});
}

function output_boards (req, res, results) {
	res.render('selectboard.jade',
		{ title: "Now select your Board on which you'd like to pin this Photo..",
		  results: results,
		  userid: req.session.userid,
		  url: req.body.url});
}

function load_error_page(req, res) {
    res.render('error.jade');
}

function redirect_to_login(req, res){

  console.log("Session started. Redirecting user to home page");
  res.writeHead(301, {Location: '/'});
  res.end();
}

exports.do_work = function(req, res) {
	console.log("IN SELECT BOARD PAGE...");
	console.log("Session Authenticated: " + req.session.userAuthenticated);
    //console.log("User ID Queried " + req.query.id);
    console.log("Session User ID: "  + req.session.userid);
	
	if (req.session.userAuthenticated)
		query_db(req, res);
	else
		redirect_to_login(req, res);
}