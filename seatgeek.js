var http = require('http');
var url = require('url');
var fs = require('fs');
var util = require('util');

// Go to localhost:8008/search

var props = ['name', 'id', 'image', 'url'];

//Routing handlers
var handle = [];
handle["search"] = function(response, requesturl){
	
	var options = {
		host: 'api.seatgeek.com', 
		path: '/2/events'
	};
	http.get(options, function(res){
		//Location 
		var locationdata = [];

		var data = '';
		res.on('data', function(chunk){
			data += chunk;
		});
		res.on('end', function(){
			//console.log(data);
			var results = JSON.parse(data);			
			var events = results.events; 
			var resultArray = [];
			var resJSON = {data:[]};
			for(var i = 0; i < events.length; i++){
				var event = events[i];
				var venue = event.venue;

				if(event.type==='concert'){
					//console.log(event.title);
					var performers = event.performers; 
					if(performers.length == 0) continue;
 					for(var j = 0; j < performers.length; j++){
						var performer = performers[j];
						resultArray.push(performer);
						console.log('performer: ');
						resJSON.data.push(performer);
						for(var k = 0; k < props.length; k++){
							//console.log('  prop: ' + props[k] + ' ' + performer[props[k]]);
						}

					}
					//process location
					if(venue){
						var address, latitude, longitude;
						address = venue.address;
						latitude = venue.location.lat;
						longitude = venue.location.lon;
						
						console.log('Venue info: ' + address + ' ' + latitude + ' ' + longitude); 
						locationdata.push({'title': event.title, 'lat': latitude, 'long': longitude});
					}
					
				}
			}
			response.write(JSON.stringify(resJSON));
			response.end();
		});

	}).on('error', function(e){
		console.log('Got error: ' + e);
	});
}

//Server 
http.createServer(function (request, response) {
	var parsedurl = url.parse(request.url, true);
	console.log('Request for ' + parsedurl.pathname + " received");
	route(parsedurl, response);
}).listen(process.env.PORT || 5000);


//Router
function route(requesturl, response){
	var pathname = requesturl.pathname.indexOf('/') == 0 ? requesturl.pathname.substring(1) : requesturl.pathname;
	console.log(pathname);
	if(typeof handle[pathname] === 'function'){
		handle[pathname](response, requesturl);
	} else if(pathname === ""){
		//serve home page
		response.writeHead(200, {'Content-Type': 'application/json'});
		handle["search"](response, requesturl);
		/*
		fs.readFile('./play.html', function (err, html) {
		    if (err) {
		        throw err; 
		    }       
		    response.writeHeader(200, {"Content-Type": "text/html"});  
		    response.write(html);  
		    response.end();
	    });  
	    */
	} else if(requesturl.pathname.indexOf('icon.png') != -1){
		//squelch for now
		var stat = fs.statSync('./icon.png');
		response.writeHead(200, {
			'Content-Type': 'image/x-icon',
	        'Content-Length': stat.size
	    });
	    var readStream = fs.createReadStream('./icon.png');
	    // We replaced all the event handlers with a simple call to util.pump()
	    util.pump(readStream, response);
		//response.end();

	} else if(requesturl.pathname.indexOf('home') != -1){
		fs.readFile('./home.html', function (err, html) {
		    if (err) {
		        throw err; 
		    }       
		    response.writeHeader(200, {"Content-Type": "text/html"});  
		    response.write(html);  
		    response.end();
	    });  
	} else if(requesturl.pathname.indexOf('bootstrap/css/custom.css.scss') != -1){
		fs.readFile('./bootstrap/css/custom.css.scss', function (err, html) {
		    if (err) {
		        throw err; 
		    }       
		    response.writeHeader(200, {"Content-Type": "text/css"});  
		    response.write(html);  
		    response.end();
	    });  
	} else if(requesturl.pathname.indexOf('bootstrap/css/bootstrap.css') != -1){
		fs.readFile('./bootstrap/css/bootstrap.css', function (err, html) {
		    if (err) {
		        throw err; 
		    }       
		    response.writeHeader(200, {"Content-Type": "text/css"});  
		    response.write(html);  
		    response.end();
	    });  
	} else if(requesturl.pathname.indexOf('bootstrap/css/bootstrap-responsive.css') != -1){
		fs.readFile('./bootstrap/css/bootstrap-responsive.css', function (err, html) {
		    if (err) {
		        throw err; 
		    }       
		    response.writeHeader(200, {"Content-Type": "text/css"});  
		    response.write(html);  
		    response.end();
	    });  
	} else {
		console.log('Fail, no request handler for ' + pathname);
		response.end();
	}
}
