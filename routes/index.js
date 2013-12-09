
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
        
        var i = 0;
        while (i < sql_results.length) {

            console.log("PHOTO ID: " + sql_results[i]["PHOTOID"] + " URL: " + sql_results[i]["URL"]);
            write_to_gridfs(req, res, db, sql_results[i]["PHOTOID"], sql_results[i]["URL"]); 
            i++;
        }
    }); 
}   


function write_to_gridfs(req, res, db, p_id, photo_url) {
    var photo_id = p_id;
    var fileId = photo_id + ".txt";
    console.log("FileID: " + fileId);

    GridStore.exist(db, fileId, function(err, exists) {
        assert.equal(null, err);
        //assert.equal(true, exists);

        if (exists) {
            //cached_photos[photo_id] = photo_url;
            return console.dir ("FILE: " + fileId + " already cached(exists) in GridFS. Not writing again!");
        }
        
        // Create a new instance of the gridstore
        var gridStore = new GridStore(db, fileId, 'w');

        // Open the file
        gridStore.open(function(err, gridStore) {
    
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
                            
                        });
                    });
                });
            });
        });
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