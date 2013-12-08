exports.do_work = function(req, res){
	res.render('interest.jade', { userid: req.session.userid });
};