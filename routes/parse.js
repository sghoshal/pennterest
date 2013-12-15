exports.get = function(json) {
    var urls = [];
    var j = JSON.parse(json);
    var n = j['d']['results'].length;
    for (var i = 0; i < n; i++)
        urls.push(j['d']['results'][i]['MediaUrl']);
    return urls;
}
