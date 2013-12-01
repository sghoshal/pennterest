exports.do_work = function(req, res){

	if(req.session)
	{
		req.session.userAuthenticated = false;
		req.session.username = null;
		req.session.destroy(function() {});
	}
	res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
	res.render('index.jade',
			{ 
		msg: "You have been successfully logged out." }
	);
};
