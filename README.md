# Chai

Chai is a GUI to support IPM prototype flights

## Requirements & Installation

Node.js
Firebase 
REST API: https://www.firebase.com/docs/rest-api.html

## Contributors
```
Pat Cappelaere	Vightel		pat@cappelaere.com

'''
Firebase URLs

Commands: 	https://ipm.firebaseIO.com/cmds
	Example:
	{
		timestamp: 1379519826879,
		cmd: "instrument_on"
	}
	
Telemetry:	https://ipm.firebaseIO.com/tlm
	Example:
	{
		lon: -76.5269046632557,
		lat: 38.423510263963166,
		alt: 3000,
		pitch: 23.55,
		roll: 23.55,
		heading: 23.55,
		instrument: 'off',
		timestamp: 1379519826879
	}
	
Downloads: 	https://ipm.firebaseIO.com/downloads
	Example:
	{ 	
		timestamp: 1379519824877,
		url: "http://localhost/scene",
		scene: "scene name"
	}

