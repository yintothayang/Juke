var User = Parse.Object.extend("User");
var Hub = Parse.Object.extend("Hub");
var QueuedSong = Parse.Object.extend("QueuedSong");

//Get PlayList
Parse.Cloud.define("getPlaylist", function(request, response) {
    var query = new Parse.Query(Hub);
    query.get(request.params.hubId, {
	success: function(hub){
	    var QueuedSong = Parse.Object.extend("QueuedSong");
	    var query = new Parse.Query(QueuedSong);
	    query.limit(1000);
	    query.include('song');
	    query.include('hub');
	    query.equalTo('hub', hub);
	    query.equalTo('active', true);
	    query.ascending('updatedAt');
	    query.find({
		success: function(results){
		    if(results.length > 0){
			var currentlyPlaying = results[0];
			results.shift();
			if(results.length > 0){
			    var hubDate = results[0].get('hub').createdAt.getTime(); 
			    var songs = [];
			    results.forEach(function(song){
				var ups = song.get('ups').length;
				var downs = song.get('downs').length;
				var s = ups - downs;
				var sign = 0;
				var order = Math.log(Math.max(Math.abs(s) ,1));
				if(s > 0){
				    sign = 1;
				} else if(s < 0){
				    sign = -1;
				} else {
				    sign = 0;
				}
				
				var seconds = (song.createdAt.getTime() ) - hubDate;
				var position = s;
				song.set('position', position);
				song.set('score', s);
			    });
			    results.sort(compare);
			    results.unshift(currentlyPlaying);
			}

			Parse.Object.saveAll(results, {
			    success: function(results){
				response.success(results);
			    },
			    error: function(error){
				console.error(error.message);
				response.error("Error :" + error.message);
			    }
			});
		    } else {
			response.success(results);
		    }
		},
		error: function(error){
		    console.error(error.message);
		    response.error("Error :" + error.message);
		}
	    });
	}, 
	error: function(object, error){
	    response.error("Error :" + error.message);
	}
    });
});

//Recently Played
Parse.Cloud.define("getRecentlyPlayed", function(request, response) {
    var query = new Parse.Query(Hub);
    query.get(request.params.hubId, {
	success: function(hub){
	    var QueuedSong = Parse.Object.extend("QueuedSong");
	    var query = new Parse.Query(QueuedSong);
	    query.limit(1000);
	    query.include('song');
	    query.include('hub');
	    query.equalTo('hub', hub);
	    query.equalTo('active', false);
	    query.find({
		success: function(results){
		    if(results.length > 0){
			response.success(results);
		    }
		},
		error: function(error){
		    console.error(error.message);
		    response.error("Error :" + error.message);
		}
	    });
	},
	error: function(object, error){
	    response.error("Error :" + error.message);
	}
    });
});


//Remove Song
Parse.Cloud.define("removeSong", function(request, response) {
    var queuedSongId = request.params.queuedSongId;
    var QueuedSong = Parse.Object.extend("QueuedSong");
    var query = new Parse.Query(QueuedSong);
    query.get(queuedSongId, {
	success: function(queuedSong){
	    queuedSong.set('active', false);
	    queuedSong.save();
	    response.success();
	},
	error: function(object, error){
	    response.error(error);
	}
    });
});

//Vote
Parse.Cloud.define("vote", function(request, response) {
    var userId = request.params.userId;
    var queuedSongId = request.params.queuedSongId;
    var vote = request.params.vote;
    
    
    var query = new Parse.Query(QueuedSong);
    query.get(queuedSongId, {
	success: function(queuedSong){
	    if(vote == "up"){
		queuedSong.addUnique("ups", userId);
		queuedSong.remove("downs", userId);
	    } else {
		queuedSong.addUnique("downs", userId);
		queuedSong.remove("ups", userId);
	    }
	    queuedSong.save();
	    response.success();
	},
	error: function(object, error){
	    response.error(error);
	},
    });
});

//comparator for queuedSong.position
function compare(a,b) {
    if (a.get('position') < b.get('position'))
	return 1;
    if (a.get('position') > b.get('position'))
	return -1;
    return 0;
}


//Create Hub
//request params - title (string), range (number), private(boolean), password(string), location(GeoPoint), user(User), type(string)
Parse.Cloud.define("createHub", function(request, response) {
    //First check if user is allowed to create a hub
    var user = request.params.user;
    var query = new Parse.Query(Hub);
    query.equalTo('owner', user);
    query.first({
	success: function(results){
	    //If user does not have a hub
	    if(results == undefined){
		var hub = new Hub();
		hub.set('title',    request.params.title);
		hub.set('range',    request.params.range);
		hub.set('private',  request.params.private);
		hub.set('password', request.params.password);
		hub.set('location', request.params.location);
		hub.set('type', request.params.type);
		hub.set('owner',    request.params.owner);
		hub.save({
		    success: function(results){
			response.success(results);
		    },
		    error: function(object, error){
			response.error(error);
		    }
		});
	    } else {
		response.error("already has hub");
	    }
	},
	error: function(error){
	    response.error(error);
	}
    });
});

//Add Song to Queue
//request params - user(User), 
Parse.Cloud.define("addSong", function(request, response) {
    //First Check if User is allowed to add a song
    



});



/**  
 *  
 *  stuff for the iPhone app
 *
 *
 */
Parse.Cloud.afterDelete("Hub", function(request) {
    var Song = Parse.Object.extend("Song");
    var query = new Parse.Query(Song);
    query.equalTo("hub", request.object);
    query.find({
        success: function(songs) {
//            console.log("i found the songs for " + request.object.id);
            Parse.Object.destroyAll(songs, {
                success: function() {
//                    console.log("i deleted shit");
                },
                error: function(error) {
                    console.error("Error deleting related comments " + error.code + ": " + error.message);
                }
            });
            
        },
        error: function(error) {
            console.error("Error finding related comments " + error.code + ": " + error.message);
        }
    });
});

Parse.Cloud.define("ytUrl", function(req, res) {
    var makoUrl = "http://makowaredev.com:3113/ytdl?id="+req.params.id;
    Parse.Cloud.httpRequest({
        method:'GET',
        url:makoUrl
    }).then(function(result){
        var obj = result.data;
        if(obj.status === 'OK'){
            res.success({'url': obj.url});
        } else {
            res.error({'err':'makoware call failed', 'data':result.data});
        }
    });
});



/**  
 *  
 *  Future oauth token swap stuff
 *
 *
 */

var kClientId = "spotify-ios-sdk-beta"
var kClientSecret = "ba95c775e4b39b8d60b27bcfced57ba473c10046"
var kClientCallbackURL = "spotify-ios-sdk-beta://callback"

var _ = require('underscore');
var express = require('express');
var app = express();
 
// Global app configuration section
app.use(express.bodyParser());  // Populate req.body

/**
 * This function is called when GitHub redirects the user back after
 *   authorization.  It calls back to GitHub to validate and exchange the code
 *   for an access token.
 */
var getSpotifyAccessToken = function(code) {
    
    var json = {
        grant_type      :   'authorization_code' ,
        client_id       :   kClientId,
        client_secret   :   kClientSecret,
        redirect_uri    :   kClientCallbackURL,
        code            :   code
    }
    return Parse.Cloud.httpRequest({
        method: 'POST',
        url: "https://ws.spotify.com/oauth/token",
        headers: {
            'Accept': 'application/json',
            'User-Agent': 'Parse.com Cloud Code'
        },
        body: json
    });
}

app.post('/swap',function(req,res){
//    res.send(reg.params);
    console.log('post to /swap');
    console.log(req.body.code);
    
    var response = getSpotifyAccessToken(req.body.code);
    
    response.then(function(obj){
//        console.log(obj);
        res.send(obj.data);
    });


});

app.listen();