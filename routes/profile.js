var connectData = { 
  "hostname": "cis550project.c2vffmuf4yhs.us-east-1.rds.amazonaws.com", 
  "user": "CIS550", 
  "password": "databaseproject", 
  "database": "CIS550" };
var oracle =  require("oracle");

var userid = null;
var username = null;
var user_display_name = null;


function get_user_info (req, res) {
    oracle.connect(connectData, function(err, connection) {
        if ( err ) {
            console.log(connection);
        } else {
            // selecting rows
            connection.execute("SELECT userid, firstname, lastname FROM users WHERE userid='" + req.query.id + "'", 
                       [], 
                       function(err, results) {
                if ( err ) {
                    console.log(err);
                } else {
                        connection.close(); // done with the connection
                        user_display_name = results[0].FIRSTNAME;
                        welcomeuser(req, res);
                    }
            }); // end connection.execute
      }
    }); // end oracle.connect
  }

function welcomeuser(req, res) {
    res.render('profile.jade',
               { "title": "Profile Page of " + user_display_name + "!",
                 "queried_id": req.query.id, "session_id": req.session.userid}
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
    console.log("PROFILE PAGE.");
    console.log("Session Authenticated: " + req.session.userAuthenticated);
    console.log("User ID Queried " + req.query.id);
    console.log("Session User ID: "  + req.session.userid);

    if (req.session.userAuthenticated) {
        if (req.session.userid == req.query.id) {
            res.writeHead(301, {Location: '/home?id=' + req.session.userid});
            res.end();
        }
        else {
          get_user_info(req, res);
        }
    }
    else
        redirect_to_login(req, res);
};