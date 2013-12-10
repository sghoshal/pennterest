exports.do_work = function(req, res) {
	res.render('addfromurl.jade',
		{ title: "Please paste the URL in this text box from which you'd like to add your Pin!",
		  userid: req.session.userid});
}