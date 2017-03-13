/* GET home page. */
exports.index = function(req, res, next) {
  res.render('index');
};

exports.downloads = function(req, res, next) {
	res.render('downloads');
};