var connect = require('connect');
var http = require('http');

var raven = require('./raven.js');

var server = connect()
	.use(connect.static('../client'))
	.use(function(request,response){
		var parsed = require('url').parse(request.url);
		var path = parsed.pathname;
		if(path.split('/')[1] == 'raven')
			raven.handleRequest(request,response);
		else {
			console.log("Fall through to 404.");
			response.statusCode = 404;
			response.end();
		}
	});

http.createServer(server).listen(1337);
