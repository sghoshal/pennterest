// Connect string to Oracle
var connectData = {
  "hostname": "cis550project.c2vffmuf4yhs.us-east-1.rds.amazonaws.com",
  "user": "CIS550",
  "password": "databaseproject",
  "database": "CIS550" };
var oracle =  require("oracle");
var query_start_time;

function query_db(req, res) {
	oracle.connect(connectData, function (err, connection) {
		var sqlGetBoards =
			"SELECT B.BOARDNAME, B.BOARDID, B.BOARD_PIC, B.BOARD_PIN_COUNT " +
			"FROM BOARD B " +
			"WHERE B.USERID='" + req.query.id+"'";

		var boardsNotFollowed =
			"select boardid "+
			"from board "+
			"where userid='" +  req.query.id + "' and boardid NOT IN (select boardid from following where userid='" + req.session.userid + "')"
		console.log ("Before if else");
		if (err) {
			console.log("There is an error" + err);
		} else {
            query_start_time = new Date().getTime();

			connection.execute(sqlGetBoards, [],
				function (err, resultsone) {
					if (err) {
						console.log("Error after first query: " + err);
					} else {
						console.log("Total number of Boards the person whom I want to follow owns: "+resultsone.length);
						connection.execute(boardsNotFollowed, [],
							function (err, resultstwo) {
								if (err) {
									console.log("Error after second query: " + err);
								} else {
                                    connection.execute(
                                        'SELECT firstname, lastname FROM users WHERE' +
                                        " userid='" + req.query.id + "'",
                                        [],
                                        function(error, username) {
                                            console.log("Time for Boards Query: " + (new Date().getTime() - query_start_time) + "ms");
                                            console.log (
                                                'And out of those, how many do I ' +
                                                'NOT follow: ' + resultstwo.length
                                            );
                                            connection.close();
                                            //output_boards(req, res, results);
                                            combine_queries(
                                                req,
                                                res,
                                                resultsone,
                                                resultstwo,
                                                username
                                            );
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

function combine_queries(req, res, resultsone, resultstwo, username) {
	var results = [];
	for (var i=0; i<resultsone.length; i++) {
		for (var j=0; j<resultstwo.length; j++) {
			if (resultsone[i].BOARDID == resultstwo[j].BOARDID) {
				results.push(0);
				break;
			}
			else if (j == resultstwo.length-1) {
				results.push(1);
				break;
			}
		}
	}
	output_boards(req, res, resultsone, results, username);
}

/*
Given a set of query results, output a table

res = HTTP result object sent back to the client
name = Name to query for
results = List object of query results */
function output_boards(req, res, resultsone, results, username) {
	res.render(
                'grid_boards',
		        {
                    pageTitle: "Boards of " + req.query.id,
		            results: resultsone,
		            results_other: results,
		            userid: req.session.userid,
		            queried_userid: req.query.id,
                    name: username,
                    search: false
                }
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
	console.log("IN BOARDS PAGE...");
	console.log("Session Authenticated: " + req.session.userAuthenticated);
    console.log("User ID Queried " + req.query.id);
    console.log("Session User ID: "  + req.session.userid);

	if (req.session.userAuthenticated)
		query_db(req, res);
	else
		redirect_to_login(req, res);
};

