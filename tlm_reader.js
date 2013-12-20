#!/usr/bin/env node

var optimist 	= require('./node_modules/optimist')
var eyes 		= require('./node_modules/eyes')
var util 		= require('util');
var fs			= require('fs');
var readline 	= require('readline');
var stream 		= require('stream');
var argv 		= require('optimist').argv;
var moment 		= require('./node_modules/moment');
var Firebase	= require('./node_modules/firebase');

var tlm 		= new Firebase('https://ipm.firebaseIO.com/tlm');

//eyes.inspect(argv, "argv")

var step = parseInt(argv.s)
var file = argv.f

var instream 	= fs.createReadStream(argv.f);
var 	lastime = 0
var		data = []

var rl = readline.createInterface({
    input: instream,
    output: process.stdout,
    terminal: false
})

rl.on('line', function(line) {
    //console.log("line:", line);
	var arr 		= line.split(" ")
	var gps_time 	= arr[0]
	var m = moment.utc("2013-12-13").add('seconds', parseInt(gps_time))
	
	var lat			= parseFloat(arr[1])
	var lon			= parseFloat(arr[2])
	var alt			= parseFloat(arr[3])
	var pitch		= parseFloat(arr[4])
	var roll		= parseFloat(arr[5])
	var heading		= parseFloat(arr[6])
	var timestamp 	= m.unix();
	
	var json = {
		'lon': lon,
		'lat': lat,
		'alt': alt,
		'timestamp': timestamp,
		"instrument": 'off',
		'pitch': pitch,
		'roll': roll,
		'heading': heading
	}
	if (lastime == 0 || timestamp >= lastime + step) {
		//setTimeout( function() {
			//console.log( "got:", gps_time, timestamp, lat, lon, alt, pitch, roll, heading )
			lastime = timestamp
			data.push(json)
			//myRootRef.set(json)
		//	rl.resume()
		//}, 3000)
		//rl.pause()
	}
	//rl.pause();
    //Do your stuff ...
    //Then write to outstream
});
rl.on('close', function() {
	console.log("end")
	// spit out data every so often
	var index = 0
	var timerid = setInterval( function() {
		var json = data[index]
		console.log(json)
		var newPushRef = tlm.push();
		newPushRef.set( json)
		index += 1
	}, step*1000)
})
//rl.pause();
