var data = require('./db'),
    jade = require('jade'),
    oracle = require('oracle'),
    db = data.db;

exports.get = function(req, res) {
    var q = Object.keys(req.query);
    if (q.length > 0) {
        var string = req.query[q[0]];
        var arr = string.split(' ');
        var photo = 'SELECT url FROM photo WHERE photoid IN (';
        var users = '';
        for (var i = 0; i < arr.length; i++) {
            photo = photo + "(SELECT photoid FROM tag WHERE tagvalue LIKE '%" + arr[i]
                          + "%')";
            users = users + '(SELECT email FROM users WHERE '+
                            'firstname ' + "LIKE '%" + arr[i] + "%'"
                       + ' OR lastname ' + "LIKE '%" + arr[i] + "%'"
                          + ' OR email ' + "LIKE '%" + arr[i] + "%')";

            if (i < arr.length - 1) {
                photo = photo + ' INTERSECT ';
                users = users + ' INTERSECT ';
            } else {
                photo = photo + ')';
            }
        }

        console.log(photo);

        oracle.connect(db, function(error, connection) {
            if (error) {
                console.log("error: " + error);
                return res.send("Connection error", 500);
            }
            connection.execute(users, [], function(error, user_res) {
                if (error) {
                    console.log("error: " + error);
                    return res.send(
                        "Query error: cannot execute search on users", 500);
                }
                connection.execute(photo, [], function(error, photo_res) {
                    if (error) {
                        console.log("error: " + error);
                        return res.send(
                            "Query error: cannot execute search on photo", 500);
                    }
                    console.log(photo_res);
                    res.render('search',
                           {
                               pageTitle: 'Search',
                               users: user_res,
                               photos: photo_res
                           }
                    );
                });
            });
        });
        return;
    }
    res.render('search',
               {
                   pageTitle: 'Search',
                   users: [],
                   photos: [],
               }
    );
}
