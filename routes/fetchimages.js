var request = require('request');

exports.do_work = function(req, res) {
var link = req.query.url;
var pagesource;

request(link, function (error, response, body) {
  if (!error && response.statusCode == 200) {
    pagesource = body;
    console.log(pagesource) // Print the google web page.

    var m,
    urls = [], 
    rex = /<img.*?src="(.*?\/([^\/"]*))".*?>/g; // working

	while ( m = rex.exec( pagesource ) ) {
	    urls.push( m[1] );
	}

	console.log( urls ); 

  }
})


	//res.render('addfromurl.jade',
	//	{ title: "Please paste the URL in this text box from which you'd like to add your Pin!",
	//	  userid: req.session.userid});
}


	//str = '<img src="http://site.org/one.jpg />\n <img src="http://site.org/two.jpg />',
    //rex = /<img[^>]+src="?([^"\s]+)"?\s*\/>/g;
    //rex = /\w+\.jpg/g;
    //rex = /img\s+src=\"\w+\.jpg\"/g;
    //rex = /src=\".*\.jpg\"/g;
    //rex = /<img src\'([^\']*)jpg\'/g;
    //rex = /\<img .+?\/\>/ig;