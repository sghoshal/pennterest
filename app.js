/**
 * Module dependencies. 
 */

/* This is app initialization code */
var express = require('express'),
	routes = require('./routes'),
	http = require('http'),
	path = require('path'),
	stylus = require('stylus'),
	nib = require("nib"),
	login = require('./routes/login'),
	signupdetails = require('./routes/signupdetails'),
	signup = require('./routes/signup'), 
	logout = require('./routes/logout'),
	user = require('./routes/user'), 
	pins = require('./routes/pins'),
	addnewpin = require('./routes/addnewpin'),
	followthisboard = require('./routes/followthisboard'),
	addfromurl = require('./routes/addnewpin/addfromurl'),
	selectboard = require('./routes/addnewpin/addfromurl/selectboard'),
	pinnewphoto = require('./routes/addnewpin/addfromurl/selectboard/pinnewphoto'),
	fetchimages = require('./routes/fetchimages'),
	pinselectedimage = require('./routes/pinselectedimage'),
	pinsphoto = require('./routes/pins/pinsphoto'),
	pinphotoonboard = require('./routes/pinphotoonboard'),
	photopinnedonboard = require('./routes/photopinnedonboard'),
	boards = require('./routes/boards'),
	createnewboard = require('./routes/createnewboard'),
	boardcreated = require('./routes/boardcreated'),
	boardpins = require('./routes/boards/boardpins'),
	boardpinphoto = require('./routes/boards/boardpins/boardpinphoto'),
	home = require('./routes/home'),
    query = require('./routes/followers');

var app = express();
init_app(app);

/* This funnction compiles the stylus CSS files, etc. */
function compile(str, path) {
	return stylus(str)
	.set('filename', path)
	.use(nib());
}

/**
 * This is app initialization code
 */ 
function init_app() {
	// all environments
	app.set('port', process.env.PORT || 8080);
	
	// Use Jade to do views
	app.set('views', __dirname + '/views');
	app.set('view engine', 'jade');
	
	app.use(express.favicon());
	// Set the express logger: log to the console in dev mode
	app.use(express.logger('dev'));
	
	app.use(express.json());
	app.use(express.urlencoded());
	app.use(express.cookieParser());
	app.use(express.session({ secret: 'groupbyawesomeness' }));
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(app.router);
	app.use(express.static(path.join(__dirname, 'public')));
	
	// Use Stylus, which compiles .styl --> CSS
	app.use(stylus.middleware(
	{ src: __dirname + '/public'
	, compile: compile
	}
	));
	
	// development only
	if ('development' == app.get('env')) {
		app.use(express.errorHandler());
	}
}

app.get('/', routes.do_work);
app.post('/login', login.do_work);
app.get('/signupdetails', signupdetails.do_work);
app.post('/signup', signup.do_work);
//when we get a request for {app/pins} we should call routes/pins.js
app.get('/pins', pins.get_user_pins);
app.get('/addnewpin', addnewpin.do_work);
app.get('/addnewpin/addfromurl', addfromurl.do_work);

app.post('/addnewpin/addfromurl/selectboard', selectboard.do_work);
app.get('/addnewpin/addfromurl/selectboard/pinnewphoto', pinnewphoto.do_work);

app.post('/fetchimages',fetchimages.do_work);
app.get('/pinselectedimage', pinselectedimage.do_work);
app.get('/pins/pinsphoto', pinsphoto.do_work);
app.get('/logout',logout.do_work);
//when we get a request for {app/boards} we should call routes/boards.js
app.get('/boards', boards.do_work);
app.get('/followthisboard', followthisboard.do_work);
app.get('/pinphotoonboard', pinphotoonboard.do_work);
app.get('/photopinnedonboard', photopinnedonboard.do_work);
app.get('/createnewboard', createnewboard.do_work);
app.post('/boardcreated',boardcreated.do_work);
app.get('/boards/boardpins', boardpins.do_work);
app.get('/boards/boardpins/boardpinphoto', boardpinphoto.do_work);
app.get('/followers', query.load);
app.get('/home', home.do_work);

http.createServer(app).listen(app.get('port'), function(){
	console.log('Express server listening on port ' + app.get('port'));
});
