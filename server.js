var express = require("express");
var http = require("http");
var app = express();


app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));

/*
app.all("*", function(request, response, next) {
  response.writeHead(200, { "Content-Type": "text/plain" });
  next();
});
*/

app.get("/", function(request, response) {
  //response.end("Welcome to the homepage!");
  response.render('index')
});

app.get("/about", function(request, response) {
  response.end("Welcome to the about page!");
});

app.get("*", function(request, response) {
  response.end("404!");
});

http.createServer(app).listen(process.env.PORT, process.env.IP);