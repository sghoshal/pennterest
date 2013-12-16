var connectData = { 
  "hostname": "cis550project.c2vffmuf4yhs.us-east-1.rds.amazonaws.com", 
  "user": "CIS550", 
  "password": "databaseproject", 
  "database": "CIS550" };
var oracle =  require("oracle");

var userid = null;

function addinterest(req,res) {
	 oracle.connect(connectData, function(err, connection) {
		    if ( err ) {
		    	console.log(err);
		    } else {
		    	var i=0;
			  	// inserting interest for a particular user
		    	
			  	connection.execute("INSERT INTO interest VALUES("+req.session.userid+",'"+req.query.interest+"')",
			  			   [], 
			  			   function(err, results) {
			  	    if ( err ) {
			  	    	console.log(err);
			  	    } 
			  	    
			  	    else{
				    	connection.close();
                        res.writeHead(301, {Location: '/interest?id=' + userid});
                        res.end();
			  	    }
			
			  	}); // end connection.execute
		    }
		}); // end oracle.connect
}

exports.do_work = function(req, res){
    console.log("IN INTEREST ADDITIONS PAGE...");
    console.log("Session Authenticated, Userid: " + req.session.userAuthenticated + ", " + req.session.userid);
    console.log("User ID Queried " + req.query.id);

	userid = req.session.userid;
	addinterest(req,res,req.query.interest);	
};