var util		= require('util'),
	fs			= require('fs');
	
module.exports = {
	index: function(req, res) {
		res.render("home/index.ejs");
	}
};