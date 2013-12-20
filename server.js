/**
 * Module dependencies.
 */

var express 		= require('express'),
	path			= require('path'),
	util			= require('util'),
	fs				= require('fs'),
	moment			= require('moment'),	
  	debug 			= require('debug')('server'),
	Firebase 		= require('firebase'),
	home			= require('./app/controllers/home'),
	cmds			= require('./app/controllers/commands');

		
var app = module.exports = express();

global.app 			= app;
app.root 			= process.cwd();

// we need to configure environment
debug(util.inspect(app.settings));

var mainEnv 	= app.root + '/config/environment'+'.js';
var supportEnv 	= app.root + '/config/environments/' + app.settings.env+'.js';
require(mainEnv)
require(supportEnv)

// load settings
require('./settings').boot(app)  

// load controllers
require('./lib/boot')(app, { verbose: !module.parent });


// =========================================
// ROUTING
//
// Home page -> app
app.get('/', 								home.index);
app.get('/cmds/:id', 						cmds.index);
app.post('/upload', 						cmds.upload);

// Firebase
app.Firebase 	= new Firebase("https://ipm.firebaseIO.com");
var start  		= app.Firebase.child('gui');
var now 	 	= moment().format()

start.set({'last-start': now }, function(error) {
	if (error) {
	    debug('start data could not be saved.' + error);
	  } else {
	    debug('start date saved successfully.');
	  }
})

// ===========================================================
// port set based on NODE_ENV settings (production, development or test)
console.log("trying to start on port:"+ app.get('port'));

if (!module.parent) {
	app.listen(app.get('port'));
	
	console.log( app.config.application+' started on port:'+app.get('port'));
}