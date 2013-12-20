var util		= require('util'),
	fs			= require('fs'),
	eyes		= require('eyes'),
	moment 		= require('moment'),
	url 		= require("url"),
	Firebase 	= require('firebase');
	
var speed = 23.55;	// m/s

var flight_plan = [
		[-76.51053835470171,38.4581113209096,3000],
		[-76.48963730540369,38.42485860612666,3000],
		[-76.48472395081011,38.412053811614,3000],
		[-76.48578251146907,38.3996934598009,3000],
		[-76.49075692011914,38.39304942973661,3000],
		[-76.50408572175901,38.38742852190326,3000],
		[-76.51527455547674,38.39857642938659,3000],
		[-76.5259667094483,38.4129462701876,3000],
		[-76.52993025878068,38.45758696586565,3000]];

function getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2-lat1);  // deg2rad below
  var dLon = deg2rad(lon2-lon1); 
  var a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ; 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  var d = R * c; // Distance in km
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI/180)
}

var sim_timer;
var instrument_on 	= false;

function Simulate() {
	var tlm = new Firebase("https://ipm.firebaseIO.com/tlm");
	tlm.remove();
	
	var index 		= 0;
	var pos			= flight_plan[index]
	var start_pos 	= {lon: pos[0], lat: pos[1], alt: pos[2], speed: speed};
	
	index 			+= 1;
	pos				= flight_plan[index]
	var end_pos		= {lon: pos[0], lat: pos[1], alt: pos[2], speed: speed};

	var dist	= getDistanceFromLatLonInKm(start_pos.lat, start_pos.lon, end_pos.lat, end_pos.lon )*1000;
	var delta_x = end_pos.lon - start_pos.lon
	var delta_y = end_pos.lat - start_pos.lat
	var cur_d	= 0;
	var cur_pos = {};
	
	sim_timer = setInterval(function () {
		var cur_speed = speed + Math.random() * 2;
		cur_d += 2 * cur_speed;	// pretend 10s
		var ratio = cur_d / dist;
		
		if( ratio > 1 ) {
			start_pos = {lon: pos[0], lat: pos[1], alt: pos[2], speed: speed};
			index += 1
			if( index >= flight_plan.length ) {
				index 		= 0
				pos			= flight_plan[index]
				start_pos 	= {lon: pos[0], lat: pos[1], alt: pos[2], speed: speed};
				index 		+= 1;
			}
			
			pos		= flight_plan[index]
			end_pos	= {lon: pos[0], lat: pos[1], alt: pos[2], speed: speed};
		
			dist	= getDistanceFromLatLonInKm(start_pos.lat, start_pos.lon, end_pos.lat, end_pos.lon )*1000;
			
			delta_x = end_pos.lon - start_pos.lon
			delta_y = end_pos.lat - start_pos.lat
			cur_d	= 0;
			cur_pos = start_pos;
		} else {
			cur_pos.lon = start_pos.lon + ratio*delta_x			
			cur_pos.lat = start_pos.lat + ratio*delta_y
		}
		
		cur_pos.instrument 	= instrument_on ? 'on' : 'off';
		cur_pos.timestamp	= new Date().getTime();	//moment().unix();
		cur_pos.speed		= cur_speed;
		cur_pos.alt			= start_pos.alt + Math.random()*3
		
		var newPushRef = tlm.push();
		newPushRef.set( cur_pos)
	}, 2000 );
}

function SendCommand( id ) {
	console.log("SendCommand:", id);
	var cmds 		= new Firebase("https://ipm.firebaseIO.com/cmds");
	var cmd 		= {timestamp: new Date().getTime(), cmd: id };
	var newPushRef 	= cmds.push();
	newPushRef.set( cmd )	
}

module.exports = {
	index: function(req, res) {
		var id 		= req.params['id']
		var status	= 200;
		
		console.log("Command:", id);
		if( id === 'sim_on') {
			Simulate();
		} else if( id === 'sim_off') {
			clearInterval(sim_timer);			
		} else if( id === 'instrument_on') {
			instrument_on = true;
			SendCommand( id )
		} else if( id === 'instrument_off') {
			instrument_on = false;
			SendCommand( id )
		} else {
			status = 500;
		}
		
		var json = { status: status };
		res.send(json)
	},
	upload: function(req, res) {
		eyes.inspect(req.files, "req_files")
		eyes.inspect(req.headers, "req_files")
		var host = "http://" + req.headers['host']
		var url  = host + "/uploads/"+ req.files.upload_file.name;
		console.log( url );
		
		fs.readFile(req.files.upload_file.path, function (err, data) {
			if( err ){
				res.send("Error uploading file:"+err);				
			} else {
				var uploads		= new Firebase("https://ipm.firebaseIO.com/uploads");
				var upload 		= {
					timestamp: 	new Date().getTime(), 
					filename: 	req.files.upload_file.name,
					size: 		req.files.upload_file.length,
					data: 		data
				};
			
				var newPushRef 	= uploads.push();
				newPushRef.set( upload );
				res.send("Thanks for uploading!");
			}
		});
	}
};