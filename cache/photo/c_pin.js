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

function read_file_mongo(req, res, p_id) {

    var photo_id = p_id;
    var fileId = photo_id + ".txt";
    MongoClient.connect('mongodb://CIS550:databaseproject@dharma.mongohq.com:10042/Pennterest-Trial', function(err, db) {
        if(!err) {
            console.log("We are connected to Mongo HQ");
        }
        console.log("FileID: " + fileId);

        console.log("Reading cached pic..." + fileId);
        GridStore.read(db, fileId, function(err, fileData) {
            if (err) {
                console.log ("ERROR in reading " + fileId + "\t" + err);
                load_backup_from_oracle(req, res, photo_id);
            }
            else {
                if (fileData == null || fileData.length == 0) {
                    load_from_oracle(req, res, p_id);
                }
                else {
                    res.writeHead(200, {
                                        'Content-Type': 'image/jpeg',
                                        'Content-Length':fileData.length});
                    
                    res.write(fileData, "binary");
                    res.end(fileData,"binary");
                    console.log('Done!');
                }
            }

        });
    }); 
}

function load_backup_from_oracle(req, res, p_id) {
    console.log("BACKUP: Loading from Oracle ...");
    var photo_id = p_id;

    oracle.connect(connectData, function (err, connection) {
        var sql_get_photo_url = "SELECT URL FROM PHOTO WHERE PHOTOID='" + photo_id + "'";
        
        if (err) {
            console.log(err);
        } else {
            connection.execute(sql_get_photo_url, [], 
                function (err, results) {
                    if (err) {
                        console.log(err);
                    } else {
                        connection.close();
                        console.log("PHOTOID: " + photo_id + "URL: " + results[0]["URL"]);
                        render_photo_from_url(req, res, photo_id, results[0]["URL"]);
                    }   
                }
            );
        }
    });

}

function render_photo_from_url(req, res, p_id, p_url) {
    var photo_id = p_id;
    var photo_url = p_url;
    
    http.get(photo_url, 
        function (response) {        
            response.setEncoding('binary');
             
            var image2 = '';
            console.log('Reading data in chunks from Photo URL first...');
            
            response.on('data', function(chunk) {
                image2 += chunk;
            });
            
            response.on('end', function() {
                console.log('Done reading data!');

                image = new Buffer(image2,"binary");

                res.writeHead(200, 
                    {'Content-Type': 'image/jpeg', 'Content-Length':image.length});
                    
                    res.write(image, "binary");
                    res.end(image,"binary");
                    console.log('Done!');
            
            });
        });
}

exports.do_work = function(req, res) {

    console.log("IN /cache/photo/c_pins PAGE...");
    console.log("Session Authenticated: " + req.session.userAuthenticated);
    console.log("PHOTO ID Queried " + req.query.pid);
    console.log("Session User ID: "  + req.session.userid);

    if (req.session.userAuthenticated) {
        read_file_mongo(req, res, req.query.pid);
    }     
    else
        redirect_to_login(req, res);
};
