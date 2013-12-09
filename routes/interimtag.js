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
			  	console.log("tag: "+req.body.tags);
			  	console.log("uid: "+req.session.userid);
			  	connection.execute("INSERT INTO tag VALUES('"+req.query.pid+"','"+req.body.tags+"')",
			  			   [], 
			  			   function(err, results) {
			  	    if ( err ) {
			  	    	console.log("Error before running insert into tag query: "+err);
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
    console.log("tag: "+req.body.tags);
	
	if (req.session.userAuthenticated)
		query_db(req, res);
	else
		redirect_to_login(req, res);
};