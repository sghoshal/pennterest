
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
var cache_write_init = require('./cache_write_init');
var express = require('express'),
    routes = require('./routes'),
    http = require('http'),
    path = require('path');

/* Oracle DB */
var connectData = { 
        "hostname": "cis550project.c2vffmuf4yhs.us-east-1.rds.amazonaws.com", 
        "user": "CIS550", 
        "password": "databaseproject", 
        "database": "CIS550" };
var oracle =  require("oracle");


/* Mongo DB methods */

function update_is_cached_oracle(photo_id) {
    console.log("Connecting to Oracle...");
    oracle.connect(connectData, function (err, connection) {
        
        var sql_update_is_cached = "UPDATE PHOTO SET IS_CACHED=1 WHERE PHOTOID='" + photo_id + "'";
        
        if (err) {
            console.log("ERR: Oracle Connection. " + err);
        } else {
            console.log("The Query: " + sql_update_is_cached);
            connection.execute(sql_update_is_cached, [], 
                function (err, results) {
                    if (err) {
                        console.log(err);
                    } else {
                        connection.close();
                        console.log("Successfully update IS_CACHED=1 FOR PHTOID: " + photo_id);
                    }   
                });
        }
    });   
}


function get_photos_to_be_cached(callback) {
    oracle.connect(connectData, function (err, connection) {
        var sql_get_photos_to_cache = 
            "SELECT P.PHOTOID, P.URL " +
            "FROM PHOTO P " + 
            "WHERE P.PIN_COUNT > 5";
        
        if (err) {
            console.log(err);
            callback(true, false);
        } else {
            connection.execute(sql_get_photos_to_cache, [], 
                function (err, results) {
                    if (err) {
                        console.log(err);
                        callback(true, false);
                    } else {
                        connection.close();
                        console.log("Total photos with PIN_COUNT > 5: " + results.length);
                        callback(false, results);
                        // cache_all_photos(results);
                    }   
                }
            );
        }
    });
}

function write_if_exists(db, p_id, p_url) {
    var photo_id = p_id;
    var photo_url = p_url;

    check_photo_exists(db, photo_id, function(err, exists) {
        if(err) return console.dir("Error in checking photo exists");
        if(!exists) 
            write_file(db, photo_id, photo_url);
    });
}



function check_photo_exists(db, photo_id, callback) {

    var fileId = photo_id + ".txt";
    console.log("Checking FileID: " + fileId);

    GridStore.exist(db, fileId, function(err, exists) {
        assert.equal(err, null);
        if (exists) {
            console.log("File: " + fileId + " ALREADY EXISTS IN MONGO!");
            callback(null, true);
        }
        else {
            console.log("File: " + fileId + " DOES NOT EXIST IN MONGO!");
            callback(null, false);
        }
    });
}


function write_file(db, p_id, p_url) {

    var photo_id = p_id;
    var photo_url = p_url;
    
    var fileId = photo_id + ".txt";
    console.log("Writing FileID: " + fileId + " to GridFS ...");

    // Create a new instance of the gridstore
    var gridStore = new GridStore(db, fileId, 'w');

    // Open the file
    gridStore.open(function(err, gridStore) {

        http.get(photo_url, function (response) {        
            response.setEncoding('binary');
             
            var image2 = '';
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
                        update_is_cached_oracle(photo_id);

                    });
                });
            });
        });
    });
}

function cache_all_photos(sql_results) {

    MongoClient.connect('mongodb://CIS550:databaseproject@dharma.mongohq.com:10042/Pennterest-Trial', function(err, db) {
        
        if (err) return console.dir("ERROR connecting to MongoHQ");

        console.log("We are connected to Mongo HQ");

        for (var i = 0; i < sql_results.length; i++) {

            var photo_id_to_cache = sql_results[i]["PHOTOID"];
            var photo_url_to_cache = sql_results[i]["URL"];
            
            console.log("PHOTO ID: " + photo_id_to_cache + " URL: " + photo_url_to_cache);
            
            /* Use this if you want to check if file already exists in Mongo and then write */             
            write_if_exists(db, photo_id_to_cache, photo_url_to_cache);
        }
    }); 
}   



exports.do_work = function() {

    console.log("IN CACHE_WRITE_INIT PAGE...");

    get_photos_to_be_cached(function(err, sql_result) {
        if(err) {
            return console.dir("ERROR in retrieving photos with pin count > 5");
        }
        else {
            if(sql_result.length <= 0) console.log("No result found!");
            else {
                for (var i = 0; i < sql_result.length; i++) {
                    console.log(sql_result[i]);
                }
            }
            console.log("Caching photos pin_count > 5 ...");
            cache_all_photos(sql_result);
        }   
    });
};

cache_write_init.do_work();
