var connectData = { 
		"hostname": "cis550project.c2vffmuf4yhs.us-east-1.rds.amazonaws.com", 
		"user": "CIS550", 
		"password": "databaseproject", 
		"database": "CIS550" };
var oracle =  require("oracle");
var mongo_cache = require('../cache/mongo_cache');
assert = require('assert');

function query_db(req, res, callback) {
	oracle.connect(connectData, function(err, connection) {
	 		var sqlGetBoardPins =
			"select p.photoid AS PID, p.url AS URL, p.avg_rating AS AVG, p.pin_count AS COUNT " +
			"from photo p, pin pi " +
			"where pi.photoid = p.photoid and pi.boardid='" + req.query.bid + "' " 
			"order by p.photoid";
		    if ( err ) {
		    	console.log(err);
                callback(true, false);
		    } else {
			  	// inserting user entry
			  	console.log("pid"+req.query.pid);
			  	console.log("bid"+req.query.bid);
			  	console.log("uid"+req.session.userid);
			  	connection.execute("INSERT INTO pin VALUES('"+req.query.pid+"','"+req.session.userid+"','"+req.query.bid+"')",
			  			   [], 
			  			   function(err, results) {
			  	    if ( err ) {
			  	    	console.log("Error after running insert query"+err);
                        callback(true, false);
			  	    } else {
			  	    	connection.execute(sqlGetBoardPins, [], 
							function (err, results) {
								if (err) {
									console.log("Error after running get board pins query: " + err);
                                    callback(true, false);
								} else {
									console.log ("Number of pins returned: "+results.length);		
									connection.close();
									output_pins(req, res, results);
                                    callback(false, true);
								}	
							}
						);
			  	    }
			  	}); // end connection.execute
		    }
		  }); // end oracle.connect
}

function output_pins (req, res, results) {
	res.render('photopinnedonboard.jade',
		   { title: "Photo pinned successfully. Here are your current pins of Board: " + req.query.bid,
		     results: results,
		     session_userid: req.session.userid,
		     queried_userid: req.query.id,
		     queried_boardid: req.query.bid }
	  );
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
	console.log("IN PHOTO PINNED ON BOARD PAGE...");
	console.log("Session Authenticated: " + req.session.userAuthenticated);
    console.log("Queried User ID: " + req.query.id + "\tPhoto ID: " + req.query.pid);
    console.log("Session User ID: "  + req.session.userid);
	
	if (req.session.userAuthenticated) {

		query_db(req, res, function (err, success) {
            assert.equal(err, false);
            if (success)
                mongo_cache.do_work(req, res, req.query.pid);
        });
    }
	else
		redirect_to_login(req, res);
}