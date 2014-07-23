//Parse Services
angular.module('jukeServices', ['ngResource'])
    .factory('ParseService', function($resource, $http, $location){

        var loaded = false;

	//Init Parse
	Parse.initialize("GU8DuOP6RzlnFFNBNOVnB5qrf6HCqxpJXSbDyN3W", "Wf6t36hyN7aPbkQzIxN6bXPMZGlr4xpdZgK1ljwG");

	//Cash current User
	var currentUser;

	//Cash current Queued Songs
	var queuedSongs = [];

	//Cash current Hub
	var currentHub;

	//$ Hubs
	var hubs = [];

	//Define Parse Objects
	var Hub = Parse.Object.extend("Hub");
	var QueuedSong = Parse.Object.extend("QueuedSong");

        var ParseService = {
	    name: "Parse",

            getPlayer : function getPlayer(callback){
                if(loaded){
                    var player = new YT.Player('player', {
                        videoId: '0gl8UKAYI7k'
                    });
                    callback(player);
                } else {
                    window.onYouTubeIframeAPIReady = function() {
                        loaded = true;
                        var player = new YT.Player('player', {
                            videoId: '0gl8UKAYI7k'
                        });
                        callback(player);
                    };
                };
            },

	    //User
	    //Login
	    login : function login(username, password, callback) {
		Parse.User.logIn(username, password, {
		    success: function(user) {
			currentUser = user;
			callback(user);
		    },
		    error: function(user, error) {
			alert("Error: " + error.message);
		    }
		});
	    },

	    //Logout
	    logout : function logout(callback) {
		Parse.User.logOut();
	    },

	    //Sign up
	    signUp : function signUp(username, password, callback) {
		var acl = new Parse.ACL();
		acl.setPublicReadAccess(true);
		Parse.User.signUp(username, password, { ACL: acl }, {
		    success: function(user) {
			currentUser = user;
			callback(user);
		    },
		    error: function(user, error) {
			alert("Error: " + error.message);
		    }
		});
	    },

	    //Get Current User
	    getCurrentUser : function getCurrentUser() {
		currentUser = Parse.User.current();
		if(currentUser){
		    return currentUser;
		}
	    },

	    //Hubs
	    //Get a Hub by its objectId
	    getHubById : function getHubById(hubId,callback){
		var query = new Parse.Query(Hub);
		query.get(hubId, {
		    success: function(hub){
			currentHub = hub;
			callback(hub);
		    },
		    error: function(object, error){
			alert("Error: " + error.message);
		    }
		});
	    },

	    //Get All Hubs
	    getHubs : function getHubs(callback){
		var query = new Parse.Query(Hub);
		query.include('owner');
		query.find({
		    success: function(hubs){
			hubs = hubs;
			callback(hubs);
		    },
		    error: function(object, error){
			alert("Error: " + error.message);
		    }
		});
	    },

	    //Get Current Hub
	    getCurrentHub : function getCurrentHub(){
		if(currentHub){
		    return currentHub;
		}
	    },

	    //Create Hub
	    createHub : function createHub(hub, callback){
		currentUser = Parse.User.current();
		var newHub = new Hub();
		newHub.set("title", hub.title);
		newHub.set("range", hub.range);
		newHub.set("owner", currentUser);
		newHub.save({
		    success: function(hub){
			currentHub = hub;
			callback(hub);
		    },
		    error: function(object, error){
			alert("Error: " + error.message);
		    }
		});
	    },

	    //get a hub's queuedSongs
	    getUsersByHubId : function getUsersByHubId(id, callback){
		var query = new Parse.Query(User);
		query.equalTo('currentHub', hubId);
		query.include('owner');
		query.find({
		    success: function(results){
			callback(results);
		    },
		    error: function(error){
			alert("Error: " + error.message);
		    }
		});
	    },

	    //Remove a song from the current playlist
	    addSong : function addSong(userId, hubId, song){
		return Parse.Cloud.run('addSong', {'userId' : userId, 'hubId' : hubId, 'song' : song}, {
		    success: function(result){
                        alert("Song successfully added");
		    },
		    error: function(error){
                        alert("Error: " + error.message);
		    }
		});
	    },

	    //Remove a song from the current playlist
	    removeSong : function removeSong(queuedSongId){
		return Parse.Cloud.run('removeSong', {'queuedSongId' : queuedSongId}, {
		    success: function(){

		    },
		    error: function(error){
			alert("Error: " + error.message);
		    }
		});
	    },

	    //Vote on a Song
	    vote : function vote(userId, queuedSongId, vote){
		return Parse.Cloud.run('vote', {'vote' : vote, 'userId' : userId, 'queuedSongId' : queuedSongId},{
		    success: function(){

		    },
		    error: function(error){
			alert("Error: " + error.message);
		    }
		});
	    },


	    //Get the Current Playlist
	    getPlaylist : function getPlaylist(hubId, callback){
		return	Parse.Cloud.run('getPlaylist', {'hubId' : hubId}, {
		    success: function(results){
			callback(results);
		    },
		    error: function(error){
			alert("Error: " + error.message);
		    }
		});
	    },

	    //Get Recently Played Songs
	    getRecentlyPlayed : function getRecentlyPlayed(hubId, callback){
		Parse.Cloud.run('getRecentlyPlayed', {'hubId' : hubId}, {
		    success: function(results){
			callback(results);
		    },
		    error: function(error){
			alert("Error: " + error.message);
		    }
		});
	    }


	};
	return ParseService;
    });
