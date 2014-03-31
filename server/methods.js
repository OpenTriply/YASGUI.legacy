Meteor.methods({
	getSettings : function() {
		return JSON.parse(Assets.getText("serverSettings.json"));
	},
	fetchPrefixes: function() {
		return JSON.parse(HTTP.get("http://prefix.cc/popular/all.file.json").content);
	},
	shortenUrl: function(longUrl) {
		return HTTP.get("http://tinyurl.com/api-create.php", {
			params: {
				url: longUrl
			}
		});
	},
	query: function(method, url, options) {
		try {
			return HTTP.call(method, url, options);
		} catch (e) {
			return new Meteor.Error(500, e.message);
		}
	}
});
//var http = Npm.require('http');
//http.createServer(function(req, res) {
//	var data = "";
//
//    req.on("data", function(chunk) {
//        data += chunk;
//    });
//    req.on("end", function() {
//    	console.log("POST: " + data);
//    });
////	console.log(req);
//  console.log("GET: " + req.url);  // Here I log the request URL, with the query string
//  res.writeHead(200, {
//    'Content-Type': 'text/plain'
//  });
//  res.end('Hello World\n');
//}).listen(1337, '127.0.0.1');
//console.log('Server running at http://127.0.0.1:1337/');