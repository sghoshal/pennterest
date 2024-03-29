var connectData = { 
		"hostname": "cis550project.c2vffmuf4yhs.us-east-1.rds.amazonaws.com", 
		"user": "CIS550", 
		"password": "databaseproject", 
		"database": "CIS550" };
var oracle =  require("oracle");

function query_db(req, res) {
	var boardname;
	var username;
	oracle.connect(connectData, function (err, connection) {
		var sqlInsertIntoFollowing = "INSERT INTO following VALUES('"+req.session.userid+"','"+req.query.bid+"')";		
		if (err) {
			console.log("Error in query: "+err);
		} else {
			connection.execute(sqlInsertIntoFollowing, [], 
				function (err, results) {
					if (err) {
						console.log("Error after inserting data into following table: "+err);
					} else {
						connection.close();
						res.writeHead(301, {Location: '/boards?id=' + req.query.id});
						res.end();
					}	
				}
			);	
		}
	});
}

function output_boards (req, res, boardname, username) {
	res.render('successpage.jade',
		{ title: "You just followed " + username + "'s Board named "+ boardname,
		  path: "/boards?id="+req.query.id,
		  message: "Go back to the Boards of " + username,
		  session_userid: req.session.userid,
		  queried_userid: req.query.id});
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
	console.log("IN FOLLOW THIS BOARD PAGE...");
	console.log("Session Authenticated: " + req.session.userAuthenticated);
    console.log("User ID Queried " + req.query.id);
    console.log("Session User ID: "  + req.session.userid);
	
	if (req.session.userAuthenticated)
		query_db(req, res);
	else
		redirect_to_login(req, res);
}