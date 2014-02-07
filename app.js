
/**
 * Module dependencies.
 */

var express = require('express');
var http = require('http');
var path = require('path');
var less = require('less');
var fs = require('fs');
var locals = require("./locals")

var app = express();

app.configure(function(){
	app.set('port', process.env.PORT || 3000);
	app.set('views', __dirname + '/views');
	app.set('view engine', 'jade');

	app.use(express.favicon());
	app.use(express.logger('dev'));
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(app.router);
	app.use(express.static(path.join(__dirname, 'public')));
	app.use(express.cookieParser());
	app.use(express.cookieSession({secret: locals.secret, key: 'connect.sid'}));

	if ('development' == app.get('env')) {
	  app.use(express.errorHandler());
	}
});


app.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});

app.get('*.less', function(req,res){
	var path = __dirname + "/public" + req.url;
	fs.readFile(path, "utf8", function(err, data) {
		if (err) throw err;
		less.render(data, function(err, css) {
			if (err) throw err;
			res.header("Content-type", "text/css");
			res.send(css);
		}); 
	}); 
}); 

var server = http.createServer(app);
server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

var io = require("socket.io").listen(server);

io.configure(function(){
	io.set("transports", ["websocket", "xhr-polling"]);
	io.set("polling duration", 5);
});

io.sockets.on('connection', require("./core/socket"));