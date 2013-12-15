var jade = require('jade'),
    parse = require('./parse'),
    request = require('request');

exports.search = function(req, res) {
    var q = Object.keys(req.query);
    if (q.length === 0) {
        return res.render(
            'grid_bing',
            {
                pageTitle: 'Web Search',
                results: [],
                userid: req.session.userid,
                search: true
            }
        );
    }

    var string = req.query[q[0]];
    var arr = string.split(' ');

    if (arr[0] === '') {
        return res.render(
            'grid_bing',
            {
                pageTitle: 'Web Search',
                results: [],
                userid: req.session.userid,
                search: true
            }
        );
    }
    bing(arr, req, res);
}

var options = {
    'auth': {
        'user': 'UThvUektO1tSoa0XEzN/pyVaqNjL5h7BydFFeG4ZxQk',
        'pass': 'UThvUektO1tSoa0XEzN/pyVaqNjL5h7BydFFeG4ZxQk'
    },
}

function bing(keys, orig_req, orig_res) {
    var url = 'https://@api.datamarket.azure.com/Bing/Search/v1/Image?Query=%27';
    for (var i = 0; i < keys.length; i++)
        url = url + keys[i] + (i < keys.length - 1 ? '%20' : '%27');
    url = url + '&Market=%27en-US%27&$top=48&$format=JSON';
    request.get(
        url,
        options,
        function(req, res, body) {
            var qres = parse.get(body);
            orig_res.render(
                'grid_bing',
                {
                    pageTitle: 'Bing Search',
                    results: qres,
                    userid: orig_req.session.userid,
                    search: true
                }
            );
        }
    );
}
