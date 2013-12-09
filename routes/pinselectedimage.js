var connectData = { 
  "hostname": "cis550project.c2vffmuf4yhs.us-east-1.rds.amazonaws.com", 
  "user": "CIS550", 
  "password": "databaseproject", 
  "database": "CIS550" };
var oracle =  require("oracle");

var boardDefaultImage = "http://fortunebrainstormtech.files.wordpress.com/2012/03/pinterest_illo.jpg";

function addboard(req,res,boardname) {
	 oracle.connect(connectData, function(err, connection) {
	 		var sqlGetBoards = 
			"SELECT B.BOARDNAME AS BN, B.BOARDID AS BID, B.BOARD_PIC, B.BOARD_PIN_COUNT AS COUNTER " +
			"FROM BOARD B " +
			"WHERE B.USERID=" + req.session.userid;
		    if ( err ) {
		    	console.log(err);
		    } else {
			  	// inserting user entry
			  	connection.execute("INSERT INTO board(boardid,boardname,userid,board_pic) VALUES(BOARDID_SEQ.nextval,'"+boardname+"','"+req.session.userid+"','"+boardDefaultImage+"')",
			  			   [], 
			  			   function(err, results) {
			  	    if ( err ) {
			  	    	console.log("Error after running insert query"+err);
			  	    } else {
			  	    	connection.execute(sqlGetBoards, [], 
							function (err, results) {
								if (err) {
									console.log("Error after running get boards query: " + err);
								} else {
									console.log ("Number of boards returned: "+results.length);		
									connection.close();
									output_boards(req, res, results);
								}	
							}
						);
			  	    }
			  	}); // end connection.execute
		    }
		  }); // end oracle.connect
}

/*
Given a set of query results, output a table

res = HTTP result object sent back to the client
name = Name to query for
results = List object of query results */
function output_boards(req, res,results) {
	res.render('pinselectedimage.jade',
		   { title: "New board created! Here are your Boards.. ",
		     results: results,
		     session_userid: req.session.userid,
		     queried_userid: req.session.userid }
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

exports.do_work = function(req, res){
	console.log("IN BOARDS CREATED PAGE...");
	console.log("Session Authenticated: " + req.session.userAuthenticated);
    console.log("Session User ID: "  + req.session.userid);
	if(req.body.boardname=='') {
		res.render('createnewboard.jade',
	   		{ error_msg: "Please give your new Board a name!" });
	}
	else {
		addboard(req,res,req.body.boardname);
	}
};