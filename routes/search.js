var data = require('./db'),
    jade = require('jade'),
    oracle = require('oracle'),
    db = data.db;

exports.get = function(req, res) {
    var q = Object.keys(req.query);
    if (q.length > 0) {
        var string = req.query[q[0]];
        var arr = string.split(' ');
        var q = 'SELECT url FROM photo WHERE photoid IN (';
        for (var i = 0; i < arr.length; i++) {
            q = q + "(SELECT photoid FROM tag WHERE tagvalue LIKE '%"
                  + arr[i]
                  + "%')" + (i === arr.length - 1 ? ')' : ' INTERSECT ');
        }

        oracle.connect(db, function(error, connection) {
            if (error) {
                console.log("error: " + error);
                return res.send("Connection error", 500);
            }
            connection.execute(q, [], function(error, rows) {
                if (error) {
                    console.log("error: " + error);
                    return res.send("Query error: cannot execute search", 500);
                }
                res.render('search',
                           {
                               pageTitle: 'Search',
                               data: rows
                           }
                );
            });
        });
        return;
    }
    res.render('search',
               {
                   pageTitle: 'Search',
                   data: []
               }
    );
}
