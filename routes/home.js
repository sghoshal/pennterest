var connectData = { 
  "hostname": "cis550project.c2vffmuf4yhs.us-east-1.rds.amazonaws.com", 
  "user": "CIS550", 
  "password": "databaseproject", 
  "database": "CIS550" };
var oracle =  require("oracle");

var userid = null;
var username = null;
var user_display_name = null;
var query_start_time;

function get_user_info (req, res) {

  var getAllPhotos = "select p1.photoid AS PID, p1.url AS URL, p1.pin_count AS COUNT, p1.avg_rating AS AVG, p1.is_cached, b1.boardid AS BOARDID, b1.boardname AS BNAME, b1.userid AS USERID " +
                     "from photo p1, board b1, pin pp1 " +
                     "where pp1.boardid = b1.boardid and p1.photoid = pp1.photoid and pp1.userid = b1.userid and p1.photoid IN " +
                     "(select p.photoid from photo p, pin pp where pp.photoid = p. photoid and pp.boardid IN " +
                     "(select f.boardid from following f where userid='" + req.session.userid + "')) and b1.boardid IN " +
                     "(select f.boardid from following f where userid='" + req.session.userid + "')";

        query_start_time = new Date().getTime();
	 oracle.connect(connectData, function(err, connection) {
		    if ( err ) {
		    	console.log(connection);
		    } else {
			  	// selecting rows
			  	connection.execute("SELECT userid, firstname, lastname FROM users WHERE userid='" + req.query.id+"'", 
			  			   [], 
			  			   function(err, results) {
			  	    if ( err ) {
			  	    	console.log(err);
			  	    } else {
                  user_display_name = results[0].FIRSTNAME;
                  connection.execute(getAllPhotos, [],
                    function (err, resultsPhotos) {
                      if (err) {
                        console.log("Error after fetching data from resultsPhotos table: " + err);
                      } else {
                        connection.close();
                        console.log("Time for Query: " + (new Date().getTime() - query_start_time) + "ms");
                        welcomeuser(req, res, resultsPhotos);
                      }
                    }
                  );
			  	    		
			  	    	}
			  	}); // end connection.execute
		  }
    }); // end oracle.connect
  }


function welcomeuser(req, res, resultsPhotos) {
  	res.render('grid_home.jade',
  		    { 
             title: "Welcome " + user_display_name + "!",
             queried_id: req.query.id, 
             user_id: req.session.userid,
             userid: req.session.userid,
             results : resultsPhotos,
             name: user_display_name
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

exports.do_work = function(req, res){
    console.log("HOME PAGE.");
    console.log("Session Authenticated: " + req.session.userAuthenticated);
    console.log("User ID Queried " + req.query.id);
    console.log("Session User ID: "  + req.session.userid);

    if (req.session.userAuthenticated) {
        if (req.query.id == req.session.userid) {
            get_user_info(req, res);
        }
        else {
            res.writeHead(301, {Location: '/profile?id=' + req.query.id});
            res.end();
        }

   }
    else
        redirect_to_login(req, res);
};