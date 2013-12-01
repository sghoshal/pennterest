var http = require('http'),
    routes = require('./routes');

var app = routes.app;

app.set('views', __dirname);
app.set('view engine', 'jade');

http.createServer(app).listen(9000);
