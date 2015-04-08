var express = require('express');
var request = require('request');

var app = express();

app.use(express.static(__dirname));

app.get('/search', function(req, res){
  var core = req.query.core;
  var q = req.query.q;
  var requestUri = 'http://localhost:8983/solr/' + core + '/select?q=' + q + '&wt=json&indent=true';
  request({
    uri: requestUri,
    timeout: 1000
    })
    .on('error', function(e){
      console.log('Error while requesting ' + requestUri);
      console.log(e);
    })
    .pipe(res);
});

app.listen(3333);
