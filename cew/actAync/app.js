 var express = require("express"),
	fs = require("fs"),
	http = require("http"),
	app = express(),
	server = http.createServer(app),
	io = require("socket.io").listen(server),
	port = 4000;


app.use("/static", express.static(__dirname + "/static"));


app.get("/pc", function(req, res){
	res.send(200, fs.readFileSync("pc.html", "utf-8"));
});

app.get("/mobile", function(req, res){
	res.send(200, fs.readFileSync("mobile.html", "utf-8"));
});

app.get("/", function(req, res){
	res.send(200, "hello world");
});


io.sockets.on("connection", function(socket){
	socket.emit("connect", { msg : "success" });

	socket.on("send", function(data){
		socket.broadcast.emit(data.device, data);
	});
});


server.listen(port, function(){
	console.log("Listening on port: " + port);
});