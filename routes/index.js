
/*
 * GET home page.
 */

exports.do_work = function(req, res){
  res.render('index', { title: 'Welcome to Pennterest!' });
};