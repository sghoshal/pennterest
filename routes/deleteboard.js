// Connect string to Oracle
var connectData = { 
  "hostname": "cis550project.c2vffmuf4yhs.us-east-1.rds.amazonaws.com", 
  "user": "CIS550", 
  "password": "databaseproject", 
  "database": "CIS550" };
var oracle =  require("oracle");

function query_db(req, res) {
	oracle.connect(connectData, function (err, connection) {
		var sqlDeleteBoard = 
			"DELETE FROM BOARD WHERE BOARDID='" + req.query.bid + "'";

		console.log ("Before if else");		
		if (err) {
			console.log("There is an error" + err);
		} else {
			connection.execute(sqlDeleteBoard, [], 
				function (err, resultsone) {
					if (err) {
						console.log("Error after running delete board query: " + err);
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
	console.log("IN DELETE BOARD PAGE...");
	console.log("Session Authenticated: " + req.session.userAuthenticated);
    console.log("Session User ID: "  + req.session.userid);
	
	if (req.session.userAuthenticated)
		query_db(req, res);
	else
		redirect_to_login(req, res);
};

