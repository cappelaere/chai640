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
