var data = require('./db'),
    jade = require('jade'),
    oracle = require('oracle'),
    db = data.db;

function get(query, template, title, people) {
    return function(req, res) {
        var id = parseInt(req.params.id);
        oracle.connect(db, function(error, connection) {
            if (error) {
                console.log('error: ' + error);
                return res.send('Connection error', 500);
            }
            connection.execute('SELECT userid FROM Users', [], function(error, rows) {
                console.log('executed');
                if (error) {
                    console.log('error: ' + error);
                    return res.send('Query error: id not found', 500);
                }
                for (key in rows) {
                    if (rows[key]['USERID'] == id) {
                        oracle.connect(db, function(error) {
                            if (error) {
                                console.log('error: ' + error);
                                return res.send('Connection error', 500);
                            }
                            connection.execute(
                                'SELECT firstname, lastname FROM users ' +
                                    "WHERE userid='" + req.params.id + "'",
                                [],
                                function(error, user) {
                                    connection.execute(
                                        query(id),
                                        [], function(error, follow) {
                                            if (error) {
                                                console.log('error' + error);
                                                return res.send(
                                                    'Query error: followers not found',
                                                    500
                                                );
                                            }
                                            res.render(
                                                template,
                                                {
                                                    pageTitle: title,
                                                    userid: req.session.userid,
                                                    results: follow,
                                                    search: false,
                                                    username: user,
                                                    type: people
                                                }
                                            );
                                        }
                                    );
                                }
                            );
                        });
                    }
                }
            });
        });
    };
}

exports.getFollowers = get(
    function(key) {
        return 'SELECT userid, firstname, lastname, profile_pic FROM users WHERE userid in (' +
                   'SELECT DISTINCT userid FROM following WHERE boardid IN (' +
                           "SELECT boardid FROM board WHERE userid='" + key +"'))";
    },
    'grid_users',
    'Followers',
    'Following'
);

exports.getFollowing = get (
    function(key) {
        return 'SELECT userid, firstname, lastname, profile_pic FROM Users WHERE userid IN (' +
                   'SELECT DISTINCT userid FROM board WHERE boardid IN (' +
                       "SELECT boardid FROM following WHERE userid='" + key + "'))";
    },
    'grid_users',
    'Following',
    'Followed by'
);
