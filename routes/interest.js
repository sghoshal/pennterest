var request = require('request');

var connectData = {
        "hostname": "cis550project.c2vffmuf4yhs.us-east-1.rds.amazonaws.com",
        "user": "CIS550",
        "password": "databaseproject",
        "database": "CIS550" };
var oracle =  require("oracle");

function query_db(req, res, query_id) {
    oracle.connect(connectData, function (err, connection) {

        var sql_get_pin = 
            "select * from interest where userid='" + query_id + "'";

        if (err) {
            console.log("Error in query: "+err);
        } else {
            connection.execute(sql_get_pin, [],
                function (err, results) {
                    if (err) {
                        console.log("Error after executing the first query: "+err);
                    } else {
                        connection.close();

                        for (var i = 0; i < results.length; i++)
                            console.log ("USERID: " + results[i]["USERID"] +
                                         " INTEREST: " + results[i]["INTERESTVALUE"]);
                        output_pins(req, res, results, query_id);
                    }
                }
            );
        }
    });
}


function redirect_to_login(req, res){

  console.log("Session started. Redirecting user to home page");
  res.writeHead(301, {Location: '/'});
  res.end();
}

function output_pins (req, res, results, query_id) {

        res.render('interest.jade', { title: 'My interests', 
                                      userid: query_id, 
                                      sessionid: req.session.userid,
                                      results: results })
}

exports.do_work = function(req, res){
    console.log("IN INTERESTS PAGE...");
    console.log("Session Authenticated: " + req.session.userAuthenticated);
    console.log("User ID Queried " + req.query.id);
    console.log("Session User ID: "  + req.session.userid);

    if (req.session.userAuthenticated) {
        query_db(req, res, req.query.id);
    }
    else {
        redirect_to_login(req, res);
    }

};