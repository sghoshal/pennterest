exports.do_work = function(req, res) {
	res.render('createnewboard.jade',
		{ userid: req.session.userid});
}