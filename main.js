var http = require('http'),
	express = require('express'),
    fs = require('fs'),
    httpProxy = require('http-proxy'),
    path = require('path'),
    sanitize = require('validator'),
	//JSZip = require('jszip'),
	app = express();

app.set('port', 5000);  
app.use(express.static(__dirname));

//Setup client server
var httpapp = http.createServer(app).listen(app.get('port'));
 
var io = require('socket.io').listen(httpapp);

 io.sockets.on('connection', function(socket) {
	console.log('user connected');
	socket.on('message_to_server', function(data) {
		var escaped_message = sanitize.escape(data["message"]);
		io.sockets.emit("message_to_client",{ name: data['name'], message: escaped_message });
	});
	
	socket.on('roll_update_message', function(data) {
		io.sockets.emit("roll_update_message_to_client", data);
	});
	
	socket.on('roll_distribution_page_loaded', function(data) {
		io.sockets.emit("roll_distribution_page_loaded_client", data);
	});
	
	socket.on('disconnect', function(){
		console.log('user disconnected');
	});
});
