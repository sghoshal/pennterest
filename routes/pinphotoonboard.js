var connectData = { 
		"hostname": "cis550project.c2vffmuf4yhs.us-east-1.rds.amazonaws.com", 
		"user": "CIS550", 
		"password": "databaseproject", 
		"database": "CIS550" };
var oracle =  require("oracle");

function query_db(req, res) {
	oracle.connect(connectData, function (err, connection) {
		console.log("pid: "+req.query.pid);
		console.log("Q_DB: uid: "+req.session.userid);
		
		
        console.log("After query declaration");
		if (err) {
			console.log("Error in query: "+err);
		} else {
            var sqlGetBoards =
            "select BOARDID, BOARDNAME " +
            "from BOARD " +
            "where USERID=" + req.session.userid + " AND BOARDID NOT IN (select BOARDID FROM PIN P where P.photoid=" + req.query.pid +" and P.userid=" + req.session.userid +")"

			connection.execute(sqlGetBoards, [], 
				function (err, results) {
					if (err) {
						console.log("Error after executing the boards query: "+err);
					} else {

						connection.close();
						console.log("Size of the results of boards query: "+results.length);
                        for (var i = 0; i < results.length; i++) {
                            console.log (results[i]);
                            console.log("ID: " + results[i].BOARDID + " BOARD: " + results[i].BOARDNAME);
                        }
						output_boards(req, res, results);
					}	
				}
			);	
		}
	});
}

function output_boards (req, res, results) {
	res.render('pinphotoonboard.jade',
		{ title: "Select your Board on which you'd like to pin this Photo..",
		  results: results,
		  userid: req.session.userid,
		  photoid: req.query.pid});
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
	console.log("IN PIN PHOTO ON BOARD PAGE...");
	console.log("Session Authenticated: " + req.session.userAuthenticated);
    console.log("User ID Queried " + req.query.id);
    console.log("Session User ID: "  + req.session.userid);
	
	if (req.session.userAuthenticated)
		query_db(req, res);
	else
		redirect_to_login(req, res);
}