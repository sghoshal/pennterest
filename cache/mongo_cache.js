
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
var mongo_cache = require('./mongo_cache')

/* Oracle DB */

var connectData = { 
        "hostname": "cis550project.c2vffmuf4yhs.us-east-1.rds.amazonaws.com", 
        "user": "CIS550", 
        "password": "databaseproject", 
        "database": "CIS550" };
var oracle =  require("oracle");


/* Mongo DB methods */
exports.get_photos = function get_photos_from_cache(req, res, sql_results) {

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


exports.write_file = function write_file(req, res, p_id, p_url) {

    var photo_id = p_id;
    var photo_url = p_url;
    
    MongoClient.connect('mongodb://CIS550:databaseproject@dharma.mongohq.com:10042/Pennterest-Trial', function(err, db) {
        if(!err) {
            console.log("We are connected to Mongo HQ");
        }
        var fileId = photo_id + ".txt";
        console.log("Writing FileID: " + fileId + "...");

        // Create a new instance of the gridstore
        var gridStore = new GridStore(db, fileId, 'w');

        // Open the file
        gridStore.open(function(err, gridStore) {
    
            http.get(photo_url, function (response) {        
                response.setEncoding('binary');
                 
                var image2 = '';
                console.log("New File. " + fileId + ". Will write it to GridFS");
                console.log('Reading data in chunks from Photo URL first...');
                
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
                            console.log('Wrote file: ' + fileId + "!\n");
                            update_is_cached_oracle(req, res, photo_id);

                        });
                    });
                });
            });
        });
    });
}


exports.check_photo_exists = function check_photo_exists(req, res, photo_id, callback) {
    MongoClient.connect('mongodb://CIS550:databaseproject@dharma.mongohq.com:10042/Pennterest-Trial', function(err, db) {
        if(!err) {
            console.log("We are connected to Mongo HQ");
        }

        var fileId = photo_id + ".txt";
        console.log("Checking FileID: " + fileId);

        GridStore.exist(db, fileId, function(err, exists) {
            assert.equal(err, null);
            if (exists) {
                console.log("File: " + fileId + " EXISTS!");
                callback(null, true);
            }
            else {
                console.log("File: " + fileId + " DOES NOT EXIST!");
                callback(null, false);
            }
        });
    }); 
}

exports.read_file = function read_file_mongo(req, res, photo_id) {
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
                //output_cached_pins(req, res, "10027");
                res.writeHead(200, {
                    'Content-Type': 'image/jpeg',
                    'Content-Length':fileData.length});


                console.log("File length is " +fileData.length);
                res.write(fileData, "binary");
                res.end(fileData,"binary");
                console.log('Done reading!');

            });

        });
    }); 
}

function redirect_to_login(req, res) {

    console.log("Session started. Redirecting user to home page");
    res.writeHead(301, {Location: '/'});
    res.end();
}


exports.get_photo_pin_count = function get_photo_pin_count(req, res, p_id) {

    var photo_id = p_id;

    oracle.connect(connectData, function (err, connection) {
        var sql_get_pin_count = 
            "SELECT PHOTOID, URL, PIN_COUNT FROM PHOTO WHERE PHOTOID='" + photo_id + "'";
        
        if (err) {
            console.log(err);
        } else {
            connection.execute(sql_get_pin_count, [], 
                function (err, results) {
                    if (err) {
                        console.log(err);
                    } else {
                        connection.close();
                        // There should be only 1 photo with a photo ID
                        assert.equal(results.length, 1);

                        var pinned_photoid = results[0]["PHOTOID"];
                        var pinned_photo_pin_count = results[0]["PIN_COUNT"];
                        var pinned_photo_url = results[0]["URL"];

                        console.log ("PHOTOID: " + pinned_photoid + 
                                     "\tPIN_COUNT: " + pinned_photo_pin_count + 
                                     "\tURL: " + pinned_photo_url);

                        if (pinned_photo_pin_count > 5) {
                            console.log ("OK. This needs to be cached!");
                            mongo_cache.check_photo_exists(req, res, pinned_photoid, 
                                function(err, exists) {
                                
                                    if(err) return console.log("ERROR in check_photo_existscallback");
                                    else {
                                        console.log("Callback Success!");
                                        
                                        if (exists) 
                                            update_is_cached_oracle(req, res, photo_id);
                                        else
                                            mongo_cache.write_file(req, res, pinned_photoid, pinned_photo_url);
                                    }
                            });
                        }

                    }   
                }
            );
        }
    });
};



function update_is_cached_oracle(req, res, photo_id) {
    oracle.connect(connectData, function (err, connection) {
        var sql_update_is_cached = 
            "UPDATE PHOTO " + 
            "SET IS_CACHED=1 WHERE PHOTOID='" + photo_id + "'";
        
        if (err) {
            console.log(err);
        } else {
            connection.execute(sql_update_is_cached, [], 
                function (err, results) {
                    if (err) {
                        console.log(err);
                    } else {
                        connection.close();
                        console.log("ORACLE: PHOTOID: " + photo_id + " IS_CACHED=1");
                    }   
                }
            );
        }
    });   
}

exports.do_work = function(req, res, p_id) {

    console.log("IN MONGO_CACHE PAGE...");
    console.log("Session Authenticated: " + req.session.userAuthenticated);
    console.log("Photo ID Queried " + p_id);
    console.log("Session User ID: "  + req.session.userid);

    if (req.session.userAuthenticated) {
        mongo_cache.get_photo_pin_count(req, res, p_id);
        // write_file_mongo(req, res, '10027', 'http://www.hdwallpapers3d.com/wp-content/uploads/2013/06/Robert-Downey-Jr-SH2-Movie-Posters-robert-downey-jr-26552473-800-1278.jpg');
        // read_file_mongo(req, res, "10027");
        // output_cached_pins(req, res, ["10026", "10024"]);
        // query_db(req, res, req.query.id);
        // check_photo_exists_mongodb(req, res, '10024');
    }
    else
        redirect_to_login(req, res);
};



/*
function zach_gridstore_impl (req, res, db) {
    var fileId = 'ourexamplefiletowrite.txt';
    // Create a new instance of the gridstore

    var gridStore = new GridStore(db, 'ourexamplefiletowrite.txt', 'w');
    // Open the file
    gridStore.open(function(err, gridStore) {

        http.get('http://www.hdwallpapers3d.com/wp-content/uploads/2013/06/Robert-Downey-Jr-SH2-Movie-Posters-robert-downey-jr-26552473-800-1278.jpg', function (response) {
      
            response.setEncoding('binary');
            
            var image2 = '';
          
            console.log('reading data in chunks first');
            response.on('data', function(chunk){
                image2 += chunk;
                console.log('reading data');
            });
            
            response.on('end', function() {
                console.log('done reading data');

                image = new Buffer(image2,"binary");
                
                // Write some data to the file
                gridStore.write(image, function(err, gridStore) {
                    assert.equal(null, err);

                    // Close (Flushes the data to MongoDB)
                    gridStore.close(function(err, result) {
                        assert.equal(null, err);
                        console.log('Wrote file');

                        
                        GridStore.read(db, fileId, function(err, fileData) {
                            console.log('Read file: ' + fileId);

                            assert.equal(image.toString('base64'), fileData.toString('base64'));
                            
                            console.log('Done, writing local images for testing purposes');
                            
                            var fd =  fs.openSync('image.jpg', 'w');

                            fs.write(fd, image, 0, image.length, 0, function(err,written){

                            });

                            var fd2 =  fs.openSync('image_copy.jpg', 'w');
                            fs.write(fd2, fileData, 0, fileData.length, 0, function(err,written){

                            });
                            
                            res.writeHead(200, {
                                'Content-Type': 'image/jpeg',
                                'Content-Length':fileData.length});

                            console.log("File length is " +fileData.length);
                            res.write(fileData, "binary");
                            res.end(fileData,"binary");
                            console.log('Really done');

                        });
                        

                    });
                });
            });

        });
    });
}
*/
