var QRAR     = require('qrar');
var drone    = require('ar-drone');
var http     = require('http');
var express  = require('express');

drone        = drone.createClient();

var codes    = new QRAR(drone);

// Command stack stuff
var commands = [];
var cmd;
var cmds = [];
var i    = 0;

// QR code recognition stuff
codes.on('qrcode', processCode);

function processCode(code) {

  if(code != 4) {

    if(commands.indexOf(code) != -1)
      return;

    commands.push(code);

    console.log(code, commands);

    drone.animate('doublePhiThetaMixed', 1000);

    return;

  }

  var first = true;

  for(command in commands) {

    cmd = commands[command];

    if(isNaN(cmd))
      continue;

    cmds.push(cmd);

    drone.after(first ? 10 : 3000, function() {

      cmd = cmds[i];

      if(cmd == 1) {

        console.log('running 1');

        this.animate('wave', 1000);
        this.stop();

      }
      else if(cmd == 2) {

        console.log('running 2');

        this.animate('flipRight', 50);
        this.stop();

      }
      else if(cmd == 3) {

        console.log('running 3');

        this.animate('turnaroundGodown', 500);
        this.stop();

      }

      ++i;

    });

    first = false;

  }

};

codes.start();

// PNG stream stuff
var png = null;

var server = http.createServer(function(req, res) {

  if (!png) {
    png = drone.createPngStream({ log : process.stderr });
  }

  res.writeHead(200, { 'Content-Type': 'multipart/x-mixed-replace; boundary=--daboundary' });

  png.on('data', sendPng);

  function sendPng(buffer) {
    res.write('--daboundary\nContent-Type: image/png\nContent-length: ' + buffer.length + '\n\n');
    res.write(buffer);
  }

});

server.listen(8000);


// Frontend stuff
var app = express();

app.set('view engine', 'jade');
app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res) {

  res.render('index');

});

var server = app.listen(3000);

// NowJS stuff
var everybody = require('now').initialize(server);

everybody.now.takeOff = function() {

  drone.takeoff();

};

everybody.now.up = function() {

  drone.up(0.5);

};

everybody.now.down = function() {

  drone.down(0.5);

};

everybody.now.left = function() {

  drone.left(0.5);

};

everybody.now.right = function() {

  drone.right(0.5);

};

everybody.now.front = function() {

  drone.front(0.5);

};

everybody.now.back = function() {

  drone.back(0.5);

};

everybody.now.clockwise = function() {

  drone.clockwise(0.5);

};

everybody.now.anticlockwise = function() {

  drone.counterClockwise(0.5);

};

everybody.now.land = function() {

  drone.land();

};

everybody.now.stop = function() {

  drone.stop();

};

// REPL it up
drone.createRepl();