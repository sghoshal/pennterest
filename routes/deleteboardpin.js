// Connect string to Oracle
var connectData = { 
  "hostname": "cis550project.c2vffmuf4yhs.us-east-1.rds.amazonaws.com", 
  "user": "CIS550", 
  "password": "databaseproject", 
  "database": "CIS550" };
var oracle =  require("oracle");

function query_db(req, res) {
	oracle.connect(connectData, function (err, connection) {
		var sqlDeletePin = 
			"DELETE FROM PIN WHERE PHOTOID='" + req.query.pid + "' AND BOARDID='" + req.query.bid + "' AND USERID='" + req.query.id + "'";

		console.log ("Before if else");		
		if (err) {
			console.log("There is an error" + err);
		} else {
			connection.execute(sqlDeletePin, [], 
				function (err, resultsone) {
					if (err) {
						console.log("Error after running delete board pin query: " + err);
					} else {
						connection.close();
						res.writeHead(301, {Location: '/boards/boardpins?id=' + req.query.id + '&bid=' + req.query.bid});
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
	console.log("IN DELETE BOARD PIN PAGE...");
	console.log("Session Authenticated: " + req.session.userAuthenticated);
    console.log("Session User ID: "  + req.session.userid);
    console.log("To be deleted USER ID: "  + req.query.id);
    console.log("To be deleted BOARD ID: "  + req.query.bid);
    console.log("To be deleted PHOTO ID: "  + req.query.pid);
	
	if (req.session.userAuthenticated)
		query_db(req, res);
	else
		redirect_to_login(req, res);
};

