//Parse Services
angular.module('jukeServices', ['ngResource'])
    .factory('ParseService', function($resource, $http, $location){

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
	    
	    //get a hub's queuedSongs
	    deleteSong : function deleteSong(queuedSong, callback){
		var promise = queuedSong[0].destroy({
		    success: function(result){
			callback(result);
		    },
		    error: function(object, error){
			alert("Error: " + error.message);
		    }
		});
		return promise;
	    },

	    //get a hub's queuedSongs
	    getQueuedSongs : function getQueuedSongsById(id, callback){
		var promise = Parse.Cloud.run('getQueuedSongsByHubId', {'hubId': id}, {
		    success: function(results){
			callback(results);
		    },
		    error: function(error){
			alert("Error: " + error.message);
		    }
		});
		return promise;
	    }
	};
	return ParseService;
    }).factory('playerService', function ($window, $rootScope, $q) {
	$window.onYouTubePlayerReady = function (id) {
            $rootScope.$broadcast("PLAYERLOADED", id);
	}
	return {
            create: function (playerId) {
		var d = $q.defer();
		var videoID = "S7cQ3b0iqLo";
		var params = { allowScriptAccess: "always" };
		var atts = { id: playerId };
		swfobject.embedSWF("http://www.youtube.com/v/" + videoID + "?version=3&enablejsapi=1&playerapiid=" + playerId,
				   "ytapiplayer", "425", "356", "9", null, null, params, atts);
		return d;
            }
	}
    });
