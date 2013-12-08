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
		    	console.log("in addinterest...");
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
				    	res.render('interest.jade', { userid: userid });
			  	    }
			
			  	}); // end connection.execute
	  	  			  
		    }
		  }); // end oracle.connect
}

exports.do_work = function(req, res){
	userid = req.session.userid;
	addinterest(req,res,req.query.interest);	
};