var http = require('http'),
    router = require('./routes/router');

var app = router.app;

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

http.createServer(app).listen(9000);
