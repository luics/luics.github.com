var express = require('express');
var proxy = require('./proxy');

var app = express();

proxy.install(app);

app.listen(3000);