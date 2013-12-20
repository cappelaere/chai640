var express 		= require('express'),
	assert			= require('assert'),
	fs				= require('fs'),
	path			= require('path'),
	debug 			= require('debug')('server'),
	engines 		= require('consolidate'),
	ejs				= require('ejs');
	
	exports.boot = function(app){
	   bootApplication(app)
	}

	// load env settings
	//app.jitsu = JSON.parse(fs.readFileSync("./jitsu.env"));

	// The port that this express app will listen on
	debug("app_port:"+app_port)
	
	var port 			= app_port;
	var hostBaseUrl 	= 'http://localhost:' + port;
	
	// Pick a secret to secure your session storage
	var sessionSecret = 'Chai-IPM-PGC-2013-09-17';

// =========================================
// settings

	
// ===========================
// App settings and middleware
function bootApplication(app) {

	// load config
	app.config = JSON.parse(fs.readFileSync("./config/config.yaml"));
		
	
	if( app.settings.env == 'production') {
		app.set('hostBaseUrl', config.hostBaseUrl)
	} else {
		app.set('hostBaseUrl', hostBaseUrl)		
	}
	
	app.set('port', port)	
	
	// define a custom res.message() method
	// which stores messages in the session
	app.response.message = function(msg){
	  // reference `req.session` via the `this.req` reference
	  var sess = this.req.session;
	  // simply add the msg to an array for later
	  sess.messages = sess.messages || [];
	  sess.messages.push(msg);
	  return this;
	};
	
	// serve static files
	app.use(express.static(__dirname + '/public'));

	app.set('views', __dirname + '/app/views')
	app.set('helpers', __dirname + '/app/helpers/')
	
	//app.set('client_side_layout', __dirname + '/app/views/clientside_layout.ejs')
	
	// set default view engine
	//app.set('view engine', 'jade')
	app.engine('html', engines.ejs);
	app.set('view engine', 'html')
	//app.set('view options', { layout: false })

	// cookieParser should be above session
	app.use(express.cookieParser())

	// bodyParser should be above methodOverride
	app.use(express.bodyParser())
	app.use(express.methodOverride())

	app.use(express.favicon())
	
	// routes should be at the last
	app.use(app.router)
	
	// expose the "messages" local variable when views are rendered
	app.use(function(req, res, next){
	  var msgs = req.session.messages || [];

	  // expose "messages" local variable
	  res.locals.messages = msgs;

	  // expose "hasMessages"
	  res.locals.hasMessages = !! msgs.length;

	  /* This is equivalent:
	   res.locals({
	     messages: msgs,
	     hasMessages: !! msgs.length
	   });
	  */

	  // empty or "flush" the messages so they
	  // don't build up
	  req.session.messages = [];
	  next();
	});
	
	// Error Handling
	app.use(function(err, req, res, next){
	  // treat as 404
	  if (~err.message.indexOf('not found')) return next()

	  // log it
	  console.error(err.stack)

	  // error page
	  res.status(500).render('500')
	})

	// assume 404 since no middleware responded
	app.use(function(req, res, next){
	  res.status(404).render('404', { url: req.originalUrl })
	})
}
 