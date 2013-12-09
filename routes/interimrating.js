// Connect string to Oracle
var connectData = { 
  "hostname": "cis550project.c2vffmuf4yhs.us-east-1.rds.amazonaws.com", 
  "user": "CIS550", 
  "password": "databaseproject", 
  "database": "CIS550" };
var oracle =  require("oracle");

function query_db(req, res) {
	oracle.connect(connectData, function(err, connection) {
		    if ( err ) {
		    	console.log("error before executing query: "+err);
		    } else {
			  	// inserting user entry
			  	console.log("pid: "+req.query.pid);
			  	console.log("tag: "+req.query.score);
			  	console.log("uid: "+req.session.userid);
			  	var myscore = 0;
			  	if (req.body.rating == 'one')
			  		myscore = 1;
			  	else if (req.body.rating == 'two')
			  		myscore = 2;
			  	else if (req.body.rating == 'three')
			  		myscore = 3;
			  	else if (req.body.rating == 'four')
			  		myscore = 4;
			  	else if (req.body.rating == 'five')
			  		myscore = 5;

			  	connection.execute("INSERT INTO rating VALUES('"+req.session.userid+"','"+req.query.pid+"',"+myscore+")",
			  			   [], 
			  			   function(err, results) {
			  	    if ( err ) {
			  	    	console.log("Error before running insert into rating query: "+err);
			  	    } else {
			  	    	connection.close();
						res.writeHead(301, {Location: '/pins/pinsphoto?id=' + req.query.id + '&pid=' + req.query.pid});
      					res.end();
			  	    }
			  	}); // end connection.execute
		    }
		}); // end oracle.connect
}

exports.do_work = function(req, res){
	console.log("IN INTERIM TAG PAGE...");
	console.log("Session Authenticated: " + req.session.userAuthenticated);
    console.log("User ID Queried " + req.query.id);
    console.log("Session User ID: "  + req.session.userid);
	
	if (req.session.userAuthenticated)
		query_db(req, res);
	else
		redirect_to_login(req, res);
};