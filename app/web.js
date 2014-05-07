/*/
  Cloak
  patrick@noodle.org, May 2013

  TODO
  1. Add Redirect to refresh page.
/*/

var d = new Date()
process.env['REFRESHED'] = d.getTime();
console.log("Refreshed at: " + process.env['REFRESHED']);
var fs = require('fs');

var express = require('express');
var app = express();
var port = process.env.PORT || 3001
var events = require('events');
var emitter = new events.EventEmitter;
var http = require('http');
var Requester = require('requester'),
requester = new Requester({debug: 1});

app.get('/', function(req, res) {
  try {
    var bucket = [];
    var targets = require('url').parse(req.url);
    emitter.getTarget = function(url) {
      var self = this;
      console.log(url);
      var r = requester.get(url, function (body) {
        self.emit('heard', body);
      });
    }
    emitter.once('heard', function(body) {
      res.send(body);
    });
    emitter.getTarget(targets.query);
  } catch (err) {
    res.send('CLOAK ERROR: Please enter a target url.<br/>' + err);
  }

});

app.get('/last-refreshed', function(req, res){
  res.send(process.env['REFRESHED']);
})

app.get('/ip', function(req, res) {
  var targets = "http://ifconfig.me/ip";
  emitter.getIP = function(url) {
    var self = this;
    console.log(url);
    var r = requester.get(url, function (body) {
      self.emit('ip', body);
    });
  }
  emitter.once('ip', function(body) {
    res.send(body);
  });
  emitter.getIP(targets);
})

app.get('/refresh-after', function(req, res){
  res.send((parseInt(process.env['REFRESHED']) + 11 * 60 * 1000 + 1000).toString());
})

app.get('/refresh', function(req, res) {
  var bucket = [];
  var self = this;
  var d = new Date()
  if (d.getTime() - process.env['REFRESHED'] > 11*60*1000 ) {
    var refreshing_sprite = "CLOAK ["+d.getTime()+"]: Boot signal sent! Proxy IP address will be renewed, now.";
    res.send(refreshing_sprite);

    process.env['REFRESHED'] = d.getTime();
    console.log("FS error is intentional, and intended to restart the dynos.");
    console.log("Refreshed at: " + process.env['REFRESHED']);
    fs.readFile('somefile.txt', function (err, data) {
      if (err) throw err;
    });
  } else {
    var refreshing_sprite = "CLOAK ["+d.getTime()+"]: IP refresh must be done after 10-12 minutes, at the earliest.";
    res.send(refreshing_sprite);
    console.log("Refreshed at: " + process.env['REFRESHED']);
  }
});

app.get('/help', function(req, res) {
  res.send('CLOAK: Please create your request by appending the target domain to the cloak address, ex: "cloak.herokuapp.com/?http://www.google.com"' );
});

app.listen(port);
console.log('BOUND:' + port);
