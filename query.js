var oracle = require('oracle');
var jade = require('jade');
var db = {
    "hostname": "cis550project.c2vffmuf4yhs.us-east-1.rds.amazonaws.com",
    "port": 1521,
    "user": "CIS550",
    "password": "databaseproject",
    "database": "CIS550"
};

exports.load =  function(req, res) {
    var id = parseInt(req.params.id);
    oracle.connect(db, function(error, connection) {
        if (error) {
            console.log("error: " + error);
            return res.send("Connection error", 500);
        }
        connection.execute("SELECT userid FROM Users", [], function(error, rows) {
            if (error) {
                console.log("error: " + error);
                return res.send("Query error: id not found", 500);
            }
            for (key in rows) {
                if (rows[key]["USERID"] === id) {
                    oracle.connect(db, function(error) {
                        if (error) {
                            console.log("error: " + error);
                            return res.send("Connection error", 500);
                        }
                        connection.execute(
                            "SELECT firstname, lastname FROM Users WHERE userid in (" +
                            "SELECT DISTINCT userid FROM Following WHERE boardid IN " +
                            "(SELECT boardid FROM Board WHERE userid=" + id +"))",
                            [], function(error, followers) {
                                if (error) {
                                    console.log("error" + error);
                                    return res.send("Query error: followers not found", 500);
                                }
                            res.render("follow.jade", {
                                                "pageTitle": "Followers",
                                                "data": followers
                                            });
                            });
                    });
                }
            }
        });
    });
}
