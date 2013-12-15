var data = require('./db'),
    jade = require('jade'),
    oracle = require('oracle'),
    db = data.db;

function get(query, template, title) {
    return function(req, res) {
        var q = Object.keys(req.query);
        if (q.length === 0)
            return blank(req, res, title);

        var string = req.query[q[0]];
        var arr = string.split(' ');

        if (arr[0] === '')
            return blank(res, title)

        var q = query(arr);

        oracle.connect(db, function(error, connection) {
            if (error) {
                console.log("error: " + error);
                return res.send("Connection error", 500);
            }
            connection.execute(q, [], function(error, qres) {
                if (error) {
                    console.log("error: " + error);
                    return res.send(
                        "Query error: cannot execute search on users", 500);
                }

                res.render(template,
                    {
                            pageTitle: title,
                            results: qres,
                            search: true,
                            userid: req.session.userid
                    }
                );
            });
        });
     }
}

function blank(req, res, title) {
    res.render(
        'grid_photos',
        {
            pageTitle: title + ' Search',
            results: [],
            search: true,
            userid: req.session.userid
        }
    );
}


function build(base, iter, early, late) {
    return function(keys) {
        query = base;
        for (var i = 0; i < keys.length; i++)
            query = query + iter(keys[i]) + (i < keys.length - 1 ? early : late);
        return query;
    }
}

exports.getUsers = get(
    build(
        '',
        function(key) {
            return "(SELECT userid, firstname, lastname, profile_pic FROM users WHERE firstname LIKE '%" + key + "%'" +
                    " OR lastname LIKE '%" + key + "%' OR email LIKE '%" + key + "%')";
        },
        ' INTERSECT ',
        ''
    ),
    'grid_users',
    'Users Search'
);

exports.getPhotos = get(
    build(
        'SELECT photoid, url FROM photo WHERE photoid IN (',
        function(key) {
            return "(SELECT photoid FROM tag WHERE tagvalue LIKE '%" + key + "%')";
        },
        ' INTERSECT ',
        ')'
    ),
    'grid_photos',
    'Photo Search'
);

exports.getInterests = get(
    build(
        'SELECT userid, firstname, lastname, profile_pic FROM users WHERE userid IN (',
        function(key) {
            return "(SELECT userid FROM interest WHERE interestvalue LIKE '%" + key +
                    "%')";
        },
        ' INTERSECT ',
        ')'
    ),
    'grid_users',
    'Interests Search'
);
