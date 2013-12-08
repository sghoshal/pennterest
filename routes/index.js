
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

var request = require('request');
var http = require('http');

var connectData = { 
  "hostname": "cis550project.c2vffmuf4yhs.us-east-1.rds.amazonaws.com", 
  "user": "CIS550", 
  "password": "databaseproject", 
  "database": "CIS550" };

var oracle =  require("oracle");

var count_written_files = 0;

function get_photos_to_be_cached(req, res) {
    oracle.connect(connectData, function (err, connection) {
        var sql_get_photos_to_cache = 
            "SELECT P.PHOTOID, P.URL " +
            "FROM PHOTO P " + 
            "WHERE P.PIN_COUNT > 5";
        
        if (err) {
            console.log(err);
        } else {
            connection.execute(sql_get_photos_to_cache, [], 
                function (err, results) {
                    if (err) {
                        console.log(err);
                    } else {
                        connection.close();
                        console.log(results.length);
                        cache_all_photos(req, res, results);
                    }   
                }
            );
        }
    });
}

function write_to_gridfs(req, res, db, photo_id, photo_url, callback) {
    fileId = photo_id + ".txt";
    console.log("FileID: " + fileId);

    GridStore.exist(db, fileId, function(err, exists) {
        assert.equal(null, err);
        //assert.equal(true, exists);

        if (exists) {
            cached_photos[photo_id] = photo_url;
            console.log("Cached: " + photo_id + ": " + cached_photos[photo_id]);
            console.log ("FILE: " + fileId + " already exists in GridFS. Not writing again!");
            callback(null, true);
        }
        
        // Create a new instance of the gridstore
        var gridStore = new GridStore(db, fileId, 'w');

        // Open the file
        gridStore.open(function(err, gridStore) {
    
            count_written_files++;
            http.get(photo_url, function (response) {
          
                response.setEncoding('binary');
                 
                var image2 = '';
                console.log("New File. " + fileId + ". Will write it to GridFS");
                console.log('Reading ata in chunks first...');
                
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
                            cached_photos[photo_id] = photo_url;
                            console.log("Cached: " + photo_id + ": " + cached_photos[photo_id]);
                            callback(null, true);
                            /*
                            GridStore.read(db, fileId, function(err, fileData) {
                                if (err) console.log ("ERROR in reading " + fileId + "\nerr");
                                
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
                            */
                        });
                    });
                });
            });

        });
    });

}


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

function cache_all_photos(req, res, sql_results) {
    console.log("In method cache_all_photos");

    
    MongoClient.connect('mongodb://CIS550:databaseproject@dharma.mongohq.com:10042/Pennterest-Trial', function(err, db) {
        if(!err) {
            console.log("We are connected to Mongo HQ");
        }
        //console.log("PHOTO ID: " + sql_results[2]["PHOTOID"] + " URL: " + sql_results[2]["URL"]);
        //zach_gridstore_impl(req, res, db);
        console.log("BAD PHOTO:\nPHOTO ID: " + sql_results[0]["PHOTOID"] + " URL: " + sql_results[0]["URL"]);
        var i = 1;
        while (i < 3) {

            console.log("PHOTO ID: " + sql_results[i]["PHOTOID"] + " URL: " + sql_results[i]["URL"]);
            write_to_gridfs(req, res, db, sql_results[i]["PHOTOID"], sql_results[i]["URL"], 
                function(err, ret) {
                    if (err) 
                        console.log("ERROR IN CALLBACK");
                    else {
                        console.log ("SUCCESS CALLBACK");
                        i++;
                    }
                } ); 
        }
        //console.log("No of new files written to GridFS: " + count_written_files); 
    }); 
}   


exports.do_work = function(req, res) {
    count_written_files = 0;

    console.log ("INDEX PAGE...");
    if (!photos_cached) {
        //get_photos_to_be_cached (req, res)
        photos_cached = true;
    }

    res.render('index', { title: 'Welcome to Pennterest!' });
};
