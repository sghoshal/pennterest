
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
var mongo_cache = require('../cache/mongo_cache');

var connectData = { 
  "hostname": "cis550project.c2vffmuf4yhs.us-east-1.rds.amazonaws.com", 
  "user": "CIS550", 
  "password": "databaseproject", 
  "database": "CIS550" };

var oracle =  require("oracle");


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


function cache_all_photos(req, res, sql_results) {
    console.log("In method cache_all_photos");

    MongoClient.connect('mongodb://CIS550:databaseproject@dharma.mongohq.com:10042/Pennterest-Trial', function(err, db) {
        if(!err) {
            console.log("We are connected to Mongo HQ");
        }
        
        for (var i = 0; i < sql_results.length; i++) {

            var photo_id_to_cache = sql_results[i]["PHOTOID"];
            var photo_url_to_cache = sql_results[i]["URL"];
            
            console.log("PHOTO ID: " + photo_id_to_cache + " URL: " + photo_url_to_cache);
            // mongo_cachewrite_to_gridfs(req, res, db, sql_results[i]["PHOTOID"], sql_results[i]["URL"]); 
            
            /* Use this if you want to check if file already exists in Mongo and then write                
            check_photo_exists(req, res, db, photo_id_to_cache, function(err, exists) {

                if(err) return console.log("ERROR in check_photo_exists callback");
                else {
                    //console.log("Callback Success!");
                    if (!exists)
                        write_file(req, res, db, photo_id_to_cache, photo_url_to_cache);
                }
            });
            */
            // Force write to Mongo
            write_file(req, res, db, photo_id_to_cache, photo_url_to_cache);
        }
    }); 
}   


function check_photo_exists(req, res, db, photo_id, callback) {
    
    var fileId = photo_id + ".txt";
    // console.log("Checking FileID: " + fileId);

    GridStore.exist(db, fileId, function(err, exists) {
        assert.equal(err, null);
        if (exists) {
            console.log("File: " + fileId + " ALREADY EXISTS IN MONGO!");
            update_is_cached_oracle(req, res, photo_id);
            callback(null, true);
        }
        else {
            console.log("File: " + fileId + " DOES NOT EXIST IN MONGO!");
            callback(null, false);
        }
    });
}


function write_file(req, res, db, p_id, photo_url) {
    
    var photo_id = p_id;
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
}

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


exports.do_work = function(req, res) {

    console.log ("INDEX PAGE...");
    if (!photos_cached) {
        get_photos_to_be_cached(req, res)
        photos_cached = true;
    }
    res.render('index', { title: 'Welcome to Pennterest!' });
};