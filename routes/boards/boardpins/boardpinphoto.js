// Connect string to Oracle
var connectData = { 
  "hostname": "cis550project.c2vffmuf4yhs.us-east-1.rds.amazonaws.com", 
  "user": "CIS550", 
  "password": "databaseproject", 
  "database": "CIS550" };
var oracle =  require("oracle");

function query_db(req, res) {
	oracle.connect(connectData, function (err, connection) {
		var sqlGetPhotoWithScore = 
			"select p.photoid AS PID, p.url AS URL, p.avg_rating AS AVG, r.score AS SCORE, p.first_pinnerid AS FPID, p.pin_count AS COUNT, t.tagvalue AS TAG " +
			"from photo p, tag t, rating r " +
			"where t.photoid = p.photoid and r.photoid = p.photoid and p.photoid=" + req.query.pid + " " + " and r.userid=" + req.query.id + " ";

		var sqlGetPhotoWithoutScore = 
			"select p.photoid AS PID, p.url AS URL, p.avg_rating AS AVG, p.first_pinnerid AS FPID, p.pin_count AS COUNT, t.tagvalue AS TAG " +
			"from photo p, tag t, rating r " +
			"where t.photoid = p.photoid and r.photoid = p.photoid and p.photoid=" + req.query.pid + " "; 

				
		console.log ("Before if else");		
		if (err) {
			console.log("Error in query" + err);
		} else {
			connection.execute(sqlGetPhotoWithScore, [], 
				function (err, results) {
					if (err) {
						console.log("Error after query: " + err);
					} else {
						console.log ("Number of rows returned: "+results.length);		
						if(results.length!=0) {
							connection.close();
							output_boardpinphoto(req, res, results);
						}
						else {
							connection.execute(sqlGetPhotoWithoutScore, [], 
								function (err, results) {
									if (err) {
										console.log("Error after query: " + err);
									} else {
										console.log ("Number of rows returned: "+results.length);		
										if(results.length!=0) {
											connection.close();
											output_boardpinphoto(req, res, results);
										}
										else {
											
										}
										
									}	
								}
							);
						}
						
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
function output_boardpinphoto(req, res,results) {
	res.render('boardpinphoto.jade',
		   { title: "Photo id:  " + req.query.pid,
		     results: results,
		     session_userid: req.session.userid,
		     queried_userid: req.query.id,
		     queried_photoid: req.query.pid }
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
	console.log("IN BOARDPINPHOTO PAGE...");
	console.log("Session Authenticated: " + req.session.userAuthenticated);
    //console.log("User ID Queried " + req.query.id);
    //console.log("Session User ID: "  + req.session.userid);
	
	if (req.session.userAuthenticated)
		query_db(req, res);
	else
		redirect_to_login(req, res);
};