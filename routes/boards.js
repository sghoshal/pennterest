// Connect string to Oracle
var connectData = { 
  "hostname": "cis550project.c2vffmuf4yhs.us-east-1.rds.amazonaws.com", 
  "user": "CIS550", 
  "password": "databaseproject", 
  "database": "CIS550" };
var oracle =  require("oracle");

function query_db(req, res) {
	oracle.connect(connectData, function (err, connection) {
		var sqlGetBoards = 
			"SELECT B.BOARDNAME AS BN, B.BOARD_PIC, COUNT(P.PHOTOID) AS COUNTER " +
			"FROM BOARD B, PIN P " +
			"WHERE B.USERID=P.USERID AND B.BOARDID=P.BOARDID " +
					"AND B.USERID=" + req.session.userid + " " +
			"GROUP BY (P.BOARDID, P.USERID, B.BOARDNAME, B.BOARD_PIC)";
		
		
		if (err) {
			console.log(err);
		} else {
			connection.execute(sqlGetBoards, [], 
				function (err, results) {
					if (err) {
						console.log(err);
					} else {
						connection.close();
						output_boards(req, res, results);
					}	
				}
			);
		}
	});
}


/////
//Given a set of query results, output a table
//
//res = HTTP result object sent back to the client
//name = Name to query for
//results = List object of query results
function output_boards(req, res,results) {
	res.render('boards.jade',
		   { title: "Boards of " + req.session.userid,
		     results: results }
	  );
}

/////
//This is what's called by the main app 
exports.do_work = function(req, res){
	console.log("USERID: " + req.session.userid);
	query_db(req, res);
};

