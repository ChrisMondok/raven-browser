var ravenHost = "localhost";
var ravenPort = 8080;
var http = require('http');

var functions = {};

function forwardRequest(request,response) {
	var newUrl = request.url.replace(/^\/raven/,"");

	var body = "";
	request.on('data',function(chunk){body += chunk});

	request.on('end',function(){
		var options = {
			host:ravenHost,
			port:ravenPort,
			path:newUrl,
			headers:{
				'Content-Type':request.headers['content-type'],
				'Content-Length':body.length
			},
			method:request.method,
		};

		var data = "";
		var req = http.request(options,function(res) {
			res.on('data',function(chunk) {
				data+=chunk;
			});
			res.on('end',function() {
				response.statusCode = res.statusCode;
				response.end(data);
			});
		});
		req.end(body,'utf-8');
	});
}

functions.databases = function(parsedRequest,response) {
	var data = "";
}

functions.getDocuments = function(parsedRequest,response) {
	var data = "";
	http.get
}

exports.handleRequest = function(request,response) {
	forwardRequest(request,response);
}

exports.setRavenURL = function(url) {
	ravenURL = url;
}
