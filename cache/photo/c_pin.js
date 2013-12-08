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

    var fileId = photo_id + ".txt";
    MongoClient.connect('mongodb://CIS550:databaseproject@dharma.mongohq.com:10042/Pennterest-Trial', function(err, db) {
        if(!err) {
            console.log("We are connected to Mongo HQ");
        }
        console.log("FileID: " + fileId);

        // Create a new instance of the gridstore
        // var gridStore = new GridStore(db, fileId, 'r');
        
        GridStore.exist(db, fileId, function(err, exists) {
            assert.equal(err, null);
            assert.equal(exists, true);

            console.log("Reading cached pic..." + fileId);
            GridStore.read(db, fileId, function(err, fileData) {
                if (err) console.log ("ERROR in reading " + fileId + "\nerr");
                
                //output_cached_pins(req, res, "10024");

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
}

function output_cached_pins (req, res, photo_id) {
    res.render('c_pin.jade', {"pid": photo_id});
}


exports.do_work = function(req, res) {

    console.log("IN CACHED PHOTO PAGE...");
    console.log("Session Authenticated: " + req.session.userAuthenticated);
    console.log("PHOTO ID Queried " + req.query.pid);
    console.log("Session User ID: "  + req.session.userid);

    if (req.session.userAuthenticated) {
        read_file_mongo(req, res, req.query.pid);
    }     
    else
        redirect_to_login(req, res);
};
