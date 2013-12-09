exports.do_work = function(req, res) {
	res.render('addnewpin.jade',
		{ title: "How would you like to add your new Pin?",
		  userid: req.session.userid});
}