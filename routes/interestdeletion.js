var connectData = { 
  "hostname": "cis550project.c2vffmuf4yhs.us-east-1.rds.amazonaws.com", 
  "user": "CIS550", 
  "password": "databaseproject", 
  "database": "CIS550" };
var oracle =  require("oracle");

var userid = null;

function deleteinterest(req,res, user_id, interest) {
	 oracle.connect(connectData, function(err, connection) {
		    if ( err ) {
		    	console.log(err);
		    } else {
		    	var i=0;
		    	var sql_delete_interest = 
                        "DELETE FROM INTEREST WHERE USERID='" + user_id + 
                        "' AND INTERESTVALUE='" + interest + "'"; 
			  	connection.execute(sql_delete_interest, [], 
			  			   function(err, results) {
			  	    if ( err ) {
			  	    	console.log(err);
			  	    } 
			  	    
			  	    else{
				    	connection.close();
                        res.writeHead(301, {Location: '/interest?id=' + user_id});
                        res.end();
			  	    }
			
			  	}); // end connection.execute
		    }
		}); // end oracle.connect
}

exports.do_work = function(req, res){
    console.log("IN INTEREST DELETION PAGE...");
    console.log("Session Authenticated, Userid: " + req.session.userAuthenticated + ", " + req.session.userid);
    console.log("User ID Queried " + req.query.id);

	user_id = req.query.id;
    interest = req.query.q;
	deleteinterest(req, res, user_id, interest);	
};