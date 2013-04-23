var connect = require('connect');
var http = require('http');

var raven = require('./raven.js');

var server = connect()
	.use(connect.static('../client'))
	.use(function(request,response){
		var parsed = require('url').parse(request.url);
		var path = parsed.pathname;
		switch (path.split('/')[1])
		{
		case 'raven':
			raven.handleRequest(request,response);
			break;
		case 'ravenHost':
			switch(request.method)
			{
			case 'GET':
				response.end(raven.getRavenHost());
				break;
			case 'PUT':
				raven.setRavenHost(parsed.query);
				response.statusCode = 204;
				response.end();
				break;
			default:
				response.statusCode = 405;
				response.end("Method not allowed");
			}
			break;
		case 'ravenPort':
			switch(request.method)
			{
			case 'GET':
				response.end(raven.getRavenPort().toString());
				break;
			case 'PUT':
				raven.setRavenPort(parsed.query);
				response.statusCode = 204;
				response.end();
				break;
			}
			break;
		default:
			response.statusCode = 404;
			response.end();
		}
	});

http.createServer(server).listen(1337);
