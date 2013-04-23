var ravenHost = "192.168.3.108";
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

exports.getRavenHost = function() {
	return ravenHost;
}

exports.setRavenHost = function(host) {
	ravenHost = host;
}

exports.getRavenPort = function() {
	return ravenPort;
}

exports.setRavenPort = function(port) {
	console.log("Set port to "+port);
	ravenPort = port;
}
