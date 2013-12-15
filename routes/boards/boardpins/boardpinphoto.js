// Connect string to Oracle
var connectData = { 
  "hostname": "cis550project.c2vffmuf4yhs.us-east-1.rds.amazonaws.com", 
  "user": "CIS550", 
  "password": "databaseproject", 
  "database": "CIS550" };
var oracle =  require("oracle");

function query_db(req, res) {
	oracle.connect(connectData, function (err, connection) {
		var sqlGetPhotoTableDetails = 
			"select photoid AS PID, url AS URL, avg_rating AS AVG, first_pinnerid AS FPID, pin_count AS COUNT " +
			"from photo " +
			"where photoid='" + req.query.pid+"'";

		var sqlGetTags = 
			"select tagvalue AS TAG " +
			"from tag " +
			"where photoid='" + req.query.pid+"'"; 

		var sqlGetMyRating =
			"select score AS SCR " +
			"from rating " +
			"where photoid='" + req.query.pid + "' and userid='" + req.session.userid+"'";  

		if (err) {
			console.log("Error before executing anything! " + err);
		} else {
			connection.execute(sqlGetPhotoTableDetails, [], 
				function (err, photoResults) {
					if (err) {
						console.log("Error while fetching data only from PHOTO table: " + err);
					} else {
						console.log ("Number of rows returned here must be 1: "+photoResults.length);		
						connection.execute(sqlGetTags, [], 
							function (err, tagResults) {
								if (err) {
									console.log("Error after fetching data from TAG table: " + err);
								} else {
									console.log ("Number of rows returned after running the tags query: "+tagResults.length);		
									connection.execute(sqlGetMyRating, [], 
										function (err, ratingResults) {
											if (err) {
												console.log("Error after fetching data from RATING table: " + err);
											} else {
												console.log ("Number of rows returned after running the ratings query: "+ratingResults.length);	
												connection.close();
												is_he_allowed_to_tag(req, res, photoResults, tagResults, ratingResults);										
											}	
										}
									);										
								}	
							}
						);
					}	
				}
			);
		}
	});
}

/* Check whether the current logged in user has pinned this particular photo 
	if yes, only then let him tag, else don't let him tag*/
function is_he_allowed_to_tag(req, res, photoResults, tagResults, ratingResults) {
	var ishe_allowed_to_tag = 0;
	oracle.connect(connectData, function (err, connection) {
		var sqlTagEligibility = 
			"select boardid " +
			"from pin " +
			"where photoid='" + req.query.pid + "' and userid='" + req.session.userid+"'";
		if (err) {
			console.log("Error before executing anything! " + err);
		} else {
			connection.execute(sqlTagEligibility, [], 
				function (err, results) {
					if (err) {
						console.log("Error after running tag eligibility query: " + err);
					} else {
						console.log ("If number of rows returned here are > 0 then he can tag: "+results.length);
						if(results.length != 0) {
							ishe_allowed_to_tag = 10;
						}
						connection.close();
						output_pinsphoto(req, res, photoResults, tagResults, ratingResults, ishe_allowed_to_tag);
					}
				}
			);	
		}
	}
	);
}	

/*
Given a set of query results, output a table

res = HTTP result object sent back to the client
name = Name to query for
results = List object of query results */
function output_pinsphoto(req, res, photoResults, tagResults, ratingResults, ishe_allowed_to_tag) {
	var hasBeenTagged = tagResults.length;
	var alreadyRated = ratingResults.length;

	res.render('pinsphoto.jade',
		   { title: "Photo id:  " + req.query.pid,
		     photoResults: photoResults,
		     tagResults: tagResults,
		     ratingResults: ratingResults,
		     hasBeenTagged: hasBeenTagged,
		     alreadyRated: alreadyRated,
		     ishe_allowed_to_tag: ishe_allowed_to_tag,
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
	console.log("IN BOARD PIN PHOTO PAGE...");
	console.log("Session Authenticated: " + req.session.userAuthenticated);
    //console.log("User ID Queried " + req.query.id);
    //console.log("Session User ID: "  + req.session.userid);
	
	if (req.session.userAuthenticated)
		query_db(req, res);
	else
		redirect_to_login(req, res);
};