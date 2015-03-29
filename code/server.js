var express = require('express');
var request = require('request');

var app = express();

app.use(express.static(__dirname));

app.get('/search', function(req, res){
  var core = req.query.core;
  var q = req.query.q;
  request('http://localhost:8983/solr/' + core + '/select?q=' + q + '&wt=json&indent=true').pipe(res);
});

app.listen(3333);
