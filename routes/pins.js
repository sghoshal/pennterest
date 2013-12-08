/**
 * 
 */
var MongoClient = require('mongodb').MongoClient;
var Db = require('mongodb').Db,
Server = require('mongodb').Server,
ReplSetServers = require('mongodb').ReplSetServers,
ObjectID = require('mongodb').ObjectID,
Binary = require('mongodb').Binary,
GridStore = require('mongodb').GridStore,
Grid = require('mongodb').Grid,
Code = require('mongodb').Code,
BSON = require('mongodb').pure().BSON,
assert = require('assert');
var MongoDB = require('mongodb');
var fs = require('fs');
var http = require('http');


var request = require('request');


var connectData = { 
		"hostname": "cis550project.c2vffmuf4yhs.us-east-1.rds.amazonaws.com", 
		"user": "CIS550", 
		"password": "databaseproject", 
		"database": "CIS550" };
var oracle =  require("oracle");


function get_cached_photos(req, res, sql_results) {

    MongoClient.connect('mongodb://CIS550:databaseproject@dharma.mongohq.com:10042/Pennterest-Trial', function(err, db) {
        if(!err) {
            console.log("We are connected to Mongo HQ");
        }
        console.log("PHOTO ID: " + sql_results[2]["PHOTOID"] + " URL: " + sql_results[2]["URL"]);
        //zach_gridstore_impl(req, res, db);
        for (var i = 3; i < 5; i++) {
            console.log("PHOTO ID: " + sql_results[i]["PHOTOID"] + " URL: " + sql_results[i]["URL"]);
            read_from_gridfs(req, res, db, sql_results[i]["PHOTOID"] + ".txt", sql_results[i]["URL"] )
        } 
    }); 
}


function get_pins(req, res, query_id) {
    oracle.connect(connectData, function (err, connection) {
        var sqlGetPins = 
            "SELECT P.PHOTOID, PH.URL " +
            "FROM USERS U, BOARD B, PIN P, PHOTO PH " +
            "WHERE U.USERID=B.USERID AND B.BOARDID=P.BOARDID " +
                    "AND P.PHOTOID=PH.PHOTOID AND " +
                    "U.USERID=" + query_id;
        
        if (err) {
            console.log(err);
        } else {
            connection.execute(sqlGetPins, [], 
                function (err, results) {
                    if (err) {
                        console.log(err);
                    } else {
                        connection.close();
                        for (var i = 0; i < results.length; i++)
                            console.log ("PHOTOID: " + results[i]["PHOTOID"]);
                        output_pins(req, res, results);
                    }   
                }
            );
        }
    });
}


function query_db(req, res, query_id) {
	oracle.connect(connectData, function (err, connection) {
		/*var sqlGetPins = 
			"SELECT P.PHOTOID, PH.URL " +
			"FROM USERS U, BOARD B, PIN P, PHOTO PH " +
			"WHERE U.USERID=B.USERID AND B.BOARDID=P.BOARDID " +
					"AND P.PHOTOID=PH.PHOTOID AND " +
					"U.USERID=" + query_id;
        */

        var sql_get_pin = 
            "SELECT PHOTOID, PH.URL, PH.IS_CACHED " + 
            "FROM PIN P NATURAL JOIN PHOTO PH " +
            "WHERE P.USERID=" + query_id;
		
		if (err) {
			console.log(err);
		} else {
			connection.execute(sql_get_pin, [], 
				function (err, results) {
					if (err) {
						console.log(err);
					} else {
						connection.close();
						for (var i = 0; i < results.length; i++)
							console.log ("PHOTOID: " + results[i]["PHOTOID"] +
                                         " IS_CACHED: " + results[i]["IS_CACHED"] +
                                         " URL:" + results[i]["URL"] );
						output_cached_pins(req, res, results);
					}	
				}
			);
		}
	});
}

function output_pins (req, res, results) {
	res.render('pins.jade', 
			{"title": "Pins of " + req.query.id, 
			 "results": results,
			 "session_userid": req.session.userid});
}

function output_cached_pins (req, res, results) {
    res.render('pins_container.jade', 
                {"title": "Pins of " + req.query.id, 
                 "session_userid": req.session.userid,
                 "results": results});
}

function load_error_page(req, res) {
    res.render('error.jade');
}

function redirect_to_login(req, res){

  console.log("Session started. Redirecting user to home page");
  res.writeHead(301, {Location: '/'});
  res.end();
}


function write_file_mongo(req, res, photo_id, photo_url) {
    MongoClient.connect('mongodb://CIS550:databaseproject@dharma.mongohq.com:10042/Pennterest-Trial', function(err, db) {
        if(!err) {
            console.log("We are connected to Mongo HQ");
        }
        fileId = photo_id + ".txt";
        console.log("FileID: " + fileId);

        GridStore.exist(db, fileId, function(err, exists) {
            assert.equal(null, err);
            //assert.equal(true, exists);

            if (exists) {
                //cached_photos[photo_id] = photo_url;
                //console.log("Cached: " + photo_id + ": " + cached_photos[photo_id]);
                console.log ("FILE: " + fileId + " already exists in GridFS. Not writing again!");
            }
            
            // Create a new instance of the gridstore
            var gridStore = new GridStore(db, fileId, 'w');

            // Open the file
            gridStore.open(function(err, gridStore) {
        
                http.get(photo_url, function (response) {
              
                    response.setEncoding('binary');
                     
                    var image2 = '';
                    console.log("New File. " + fileId + ". Will write it to GridFS");
                    console.log('Reading data in chunks first...');
                    
                    response.on('data', function(chunk){
                        image2 += chunk;
                        //console.log('reading data');
                    });
                    
                    response.on('end', function() {
                        console.log('Done reading data!');

                        image = new Buffer(image2,"binary");
                        
                        // Write some data to the file
                        gridStore.write(image, function(err, gridStore) {
                            assert.equal(null, err);

                            // Close (Flushes the data to MongoDB). ie Overwrites previous value
                            gridStore.close(function(err, result) {
                                assert.equal(null, err);
                                console.log('Wrote file: ' + fileId);

                            });
                        });
                    });
                });

            });
        });
    });
}


function check_photo_exists_mongodb(req, res, photo_id) {
    MongoClient.connect('mongodb://CIS550:databaseproject@dharma.mongohq.com:10042/Pennterest-Trial', function(err, db) {
        if(!err) {
            console.log("We are connected to Mongo HQ");
        }

        fileId = photo_id + ".txt";
        console.log("FileID: " + fileId);

        GridStore.exist(db, fileId, function(err, exists) {
            assert.equal(err, null);
            assert.equal(exists, true);
            console.log("File " + fileId + "does not exist!");

        });
    }); 
}

function read_file_mongo(req, res, photo_id) {
    MongoClient.connect('mongodb://CIS550:databaseproject@dharma.mongohq.com:10042/Pennterest-Trial', function(err, db) {
        if(!err) {
            console.log("We are connected to Mongo HQ");
        }
        fileId = photo_id + ".txt";
        console.log("FileID: " + fileId);

        GridStore.exist(db, fileId, function(err, exists) {
            assert.equal(err, null);
            assert.equal(exists, true);

            GridStore.read(db, fileId, function(err, fileData) {
                if (err) console.log ("ERROR in reading " + fileId + "\nerr");
                
                output_cached_pins(req, res, "10024");

            });

        });
    }); 
}


exports.get_user_pins = function(req, res) {

	console.log("IN PINS PAGE...");
	console.log("Session Authenticated: " + req.session.userAuthenticated);
    console.log("User ID Queried " + req.query.id);
    console.log("Session User ID: "  + req.session.userid);

	if (req.session.userAuthenticated)
        // write_file_mongo(req, res, '10024', 'http://upload.wikimedia.org/wikipedia/commons/7/73/Lion_waiting_in_Namibia.jpg');
		// read_file_mongo(req, res, "10026");
        // output_cached_pins(req, res, ["10026", "10024"]);
        query_db(req, res, req.query.id);

        //check_photo_exists_mongodb(req, res, '10024');
	else
		redirect_to_login(req, res);
};
