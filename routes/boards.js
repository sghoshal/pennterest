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
			"SELECT B.BOARDNAME AS BN, B.BOARD_PIC, COUNT(P.PHOTOID) AS COUNTER " +
			"FROM BOARD B, PIN P " +
			"WHERE B.USERID=P.USERID AND B.BOARDID=P.BOARDID " +
					"AND B.USERID=" + req.query.id + " " +
			"GROUP BY (P.BOARDID, P.USERID, B.BOARDNAME, B.BOARD_PIC)";
		
		
		if (err) {
			console.log(err);
		} else {
			connection.execute(sqlGetBoards, [], 
				function (err, results) {
					if (err) {
						console.log(err);
					} else {
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
		     session_userid: req.session.userid }
	  );
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
		load_error_page(req, res);
};

