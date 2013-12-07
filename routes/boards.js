// Connect string to Oracle
var connectData = { 
  "hostname": "cis550project.c2vffmuf4yhs.us-east-1.rds.amazonaws.com", 
  "user": "CIS550", 
  "password": "databaseproject", 
  "database": "CIS550" };
var oracle =  require("oracle");

function query_db(req, res) {
	oracle.connect(connectData, function (err, connection) {
		var sqlGetBoards = 
			"SELECT B.BOARDNAME AS BN, B.BOARDID AS BID, B.BOARD_PIC, B.BOARD_PIN_COUNT AS COUNTER " +
			"FROM BOARD B " +
			"WHERE B.USERID=" + req.query.id;
		console.log ("Before if else");		
		if (err) {
			console.log("There is an error" + err);
		} else {
			connection.execute(sqlGetBoards, [], 
				function (err, results) {
					if (err) {
						console.log("DB query: " + err);
					} else {
						console.log ("Returned result from DB");		
						connection.close();
						output_boards(req, res, results);
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
function output_boards(req, res,results) {
	res.render('boards.jade',
		   { title: "Boards of " + req.query.id,
		     results: results,
		     session_userid: req.session.userid,
		     queried_userid: req.query.id }
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
	console.log("IN BOARDS PAGE...");
	console.log("Session Authenticated: " + req.session.userAuthenticated);
    console.log("User ID Queried " + req.query.id);
    console.log("Session User ID: "  + req.session.userid);
	
	if (req.session.userAuthenticated)
		query_db(req, res);
	else
		redirect_to_login(req, res);
};

