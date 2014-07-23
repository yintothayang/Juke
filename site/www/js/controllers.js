'use strict';




//Player Controller
var PlayerCtrl = function($scope, $location, ParseService, playerService, $http, $q, $timeout, $window){
    //Get Hub by objectId
    $scope.getHubById = function(hubId){
	ParseService.getHubById(hubId, function(results){
	    $scope.$apply(function(){
		if(results != undefined){
		    $scope.hub = results;
		    $scope.getQueuedSongs();
		} else{
		    //$location.path('/hubs');
		}
	    });
	});
    };
    
    //Get the current hub's queuedSongs
    $scope.getQueuedSongs = function(){
	return ParseService.getQueuedSongs($scope.hub.id, function(results){
	    $scope.$apply(function(){
		if(results != undefined){
		    $scope.queuedSongs = results;
		    console.log('got queue');
		    console.log(results);
		} else {
		    alert("No Songs in Queue");
		}
	    });
	});
    };

    //Get the current hub's users
    $scope.getUsersByHubId = function(hubId){
	ParseService.getUsersByHubId(hubId, function(results){
	    $scope.$apply(function(){
		$scope.hubUsers = results;
	    });
	});
    };



    //Init Player
    $scope.initPlayer = function(){
	$scope.ytQ = playerService.create("ytplayer");
	$scope.ytQ.promise.then(function (id) {
            $scope.player = document.getElementById(id);
	    $scope.player.addEventListener("onStateChange", "onPlayerStateChange");
	    $scope.loadNext();
	}, function (id) {
            alert("Error: player failed to load");
	});

    }

    //on Player State Change
    $window.onPlayerStateChange = function(newState){
	console.log("New Player State: " +  newState);
	switch (newState){
	case 0:
	    $scope.loadNext();
	    break;
	}
    }
    
    //Delete song that just finished from queue
    $scope.deleteSong = function(){
	console.log('delete');
	return ParseService.deleteSong($scope.queuedSongs, function(results){
	});
    }

    //Load next Song
    $scope.loadNext = function(){
	console.log('load');
	var promise = $scope.getQueuedSongs();
	promise.then(function(results) {
	    if($scope.queuedSongs.length > 0){
		var songId = $scope.queuedSongs[0].get('song').get('youtubeId');
		$scope.player.loadVideoById(songId);
		var promise2 = $scope.deleteSong();
		promise2.then(function(results){
		    $scope.getQueuedSongs();
		});
	    }
	});
    }

    //Listen for playerloaded
    $scope.$on("PLAYERLOADED", function (e, id) {
        $scope.ytQ.resolve(id); 
        $scope.$apply(); 
    });

    //Search for a youtube Video
    $scope.getVideos = function(){
	return $http.get("https://www.googleapis.com/youtube/v3/search", {
	    params: {
		part: "snippet",
		q: $scope.searchParam,
		type: "video",
		maxResults: 20,
		key: "AIzaSyBbe9WJQm4LmnZJ2HzgU8odGnItzXjdwDQ"
	    }
	}).then(function(res){
	    $scope.searchResults = res.data.items;
	});
    }

    //Add song from Youtube
    $scope.addSong = function(result){
	var Song = Parse.Object.extend("Song");
	var QueuedSong = Parse.Object.extend("QueuedSong");
	var song = new Song();
	var queuedSong = new QueuedSong();

	song.set('title', result.snippet.title);
	song.set('description', result.snippet.description);
	song.set('thumbnail', result.snippet.thumbnails.default.url);
	song.set('youtubeId', result.id.videoId);

	queuedSong.set('hub', $scope.hub);
	queuedSong.set('score', 1);
	var ups = [$scope.currentUser.id];
	queuedSong.set('ups', ups);
	queuedSong.set('downs', []);

	song.save(null, {
	    success: function(song){
		queuedSong.set('song', song);
		queuedSong.save(null, {
		    success: function(queuedSong){
			alert("Song added successfully!");
			$scope.getQueuedSongs($scope.hub);
		    },
		    error: function(object, error){
			alert("Error: " + error.message);
		    }
		});
	    },
	    error: function(object, error){
		alert("Error: " + error.message);
	    }
	});
    }

    //init
    $scope.init = function(){
	$scope.currentUser = ParseService.getCurrentUser();
	if($scope.currentUser == undefined){
	    $location.path('#');
	}
	$scope.currentView = 'PlayList';
	$scope.getHubById($location.absUrl().split("/")[($location.absUrl().split("/").length) - 1]);

	$scope.searchResults = {};
	$scope.initPlayer();
    }

    //Init
    $scope.init();
}


//Hub Controller
var HubCtrl = function($rootScope, $scope, $location, $modal, $log, $http, $q, $timeout, ParseService){
    //Get Hub by objectId
    $scope.getHubById = function(hubId){
	ParseService.getHubById(hubId, function(results){
	    $scope.$apply(function(){
		if(results != undefined){
		    $scope.hub = results;
		    $scope.getQueuedSongs();
		} else{
		    //$location.path('/hubs');
		}
	    });
	});
    };
    
    //Get the current hub's queuedSongs
    $scope.getQueuedSongs = function(){
	return ParseService.getQueuedSongs($scope.hub.id, function(results){
	    $scope.$apply(function(){
		if(results != undefined){
		    $scope.queuedSongs = results;
		} else {
		    alert("No Songs in Queue");
		}
	    });
	});
    };

    //Get the current hub's users
    $scope.getUsersByHubId = function(hubId){
	ParseService.getUsersByHubId(hubId, function(results){
	    $scope.$apply(function(){
		$scope.hubUsers = results;
	    });
	});
    };

    //Search for a youtube Video
    $scope.getVideos = function(){
	return $http.get("https://www.googleapis.com/youtube/v3/search", {
	    params: {
		part: "snippet",
		q: $scope.searchParam,
		type: "video",
		maxResults: 20,
		key: "AIzaSyBbe9WJQm4LmnZJ2HzgU8odGnItzXjdwDQ"
	    }
	}).then(function(res){
	    $scope.searchResults = res.data.items;
	});
    }

    //Add song from Youtube
    $scope.addSong = function(result){
	var Song = Parse.Object.extend("Song");
	var QueuedSong = Parse.Object.extend("QueuedSong");
	var song = new Song();
	var queuedSong = new QueuedSong();

	song.set('title', result.snippet.title);
	song.set('description', result.snippet.description);
	song.set('thumbnail', result.snippet.thumbnails.default.url);
	song.set('youtubeId', result.id.videoId);

	queuedSong.set('hub', $scope.hub);
	queuedSong.set('score', 1);
	var ups = [$scope.currentUser.id];
	queuedSong.set('ups', ups);
	queuedSong.set('downs', []);

	song.save(null, {
	    success: function(song){
		queuedSong.set('song', song);
		queuedSong.save(null, {
		    success: function(queuedSong){
			alert("Song added successfully!");
			$scope.getQueuedSongs($scope.hub);
		    },
		    error: function(object, error){
			alert("Error: " + error.message);
		    }
		});
	    },
	    error: function(object, error){
		alert("Error: " + error.message);
	    }
	});
    }

    //Give Up Vote
    $scope.upVote = function(queuedSong){
	if($.inArray($scope.currentUser.id, queuedSong.get('ups')) > -1){
	    //User already up voted

	} else {
	    //Add User Id to ups, and remove it from downs if there
	    var id = $scope.currentUser.id;
	    var ups = queuedSong.get('ups');
	    ups.push(id);
	    queuedSong.set('ups', ups);

	    var downs = queuedSong.get('downs');
	    for (var i = downs.length-1; i>=0; i--) {
		if (downs[i] === id) {
		    downs.splice(i, 1);
		    break;
		}
	    }
	    queuedSong.set('downs', downs);

	    //now save queuedSong, then pull back down
	    queuedSong.save(null, {
		success: function(queuedSong){
		    $scope.getQueuedSongs();
		    console.log($scope.queuedSongs);
		},
		error: function(object, error){
		    alert("Error: " + error.message);
		}
	    });
	}
    }

    //Give Down Vote
    $scope.downVote = function(queuedSong){
	if($.inArray($scope.currentUser.id, queuedSong.get('downs')) > -1){
	    //User already up voted

	} else {
	    //Add User Id to ups, and remove it from downs if there
	    var id = $scope.currentUser.id;
	    var downs = queuedSong.get('downs');
	    downs.push(id);
	    queuedSong.set('downs', downs);

	    var ups = queuedSong.get('ups');
	    for (var i = ups.length-1; i>=0; i--) {
		if (ups[i] === id) {
		    ups.splice(i, 1);
		    break;
		}
	    }
	    queuedSong.set('ups', ups);

	    //now save queuedSong, then pull back down
	    queuedSong.save(null, {
		success: function(queuedSong){
		    $scope.getQueuedSongs();
		    console.log($scope.queuedSongs);
		},
		error: function(object, error){
		    alert("Error: " + error.message);
		}
	    });
	}
    }

    //Did current User vote on a song?
    $scope.didVote = function(queuedSong, type){
	if($.inArray($scope.currentUser.id, queuedSong.get(type)) > -1){
	    return true;
	} else {
	    return false;
	}
    }



    //Hub List View
    //Modal
    $scope.open = function(){
	$scope.hub = {};

	var modalInstance = $modal.open({
	    templateUrl: 'partials/modal.html',
	    controller: ModalCtrl,
	    resolve: {
		hub: function(){
		    return $scope.hub;
		}
	    }
	});
	
	modalInstance.result.then(function (hub) {
	    $scope.hub = hub;
	    $scope.createHub();
	}, function () {

	});
    };
    
    //Get all Hubs
    $scope.getHubs = function(){
	ParseService.getHubs(function(results){
	    $scope.$apply(function(){
		$scope.hubs = results;
	    });
	});
    };

    //Connect to Hub
    $scope.connectToHub = function(hub){
	if(hub.get('owner').id == $scope.currentUser.id){
	    $location.path('/player/' + hub.id);
	} else {
	    //auth
	    $location.path('/hubs/' + hub.id);
	}
    }

    //View User
    $scope.viewUser = function(userId){
	$location.path('/user/' + userId);
    }

    //Create Hub
    $scope.createHub = function(){
	ParseService.createHub($scope.hub, function(results){
	    $scope.$apply(function(){
		if(results != undefined){
		    $location.path('/player/' + results.id);
		}
	    });
	});
    };

    //Init
    $scope.init = function(){
	$scope.currentUser = ParseService.getCurrentUser();
	if($scope.currentUser == undefined){
	    $location.path('/');
	}
	if ($location.absUrl().split("/")[$location.absUrl().split("/").length - 1] == "hubs"){
	    $scope.getHubs();
	} else {
	    $scope.currentView = "PlayList";
	    var hubId = $location.absUrl().split("/")[$location.absUrl().split("/").length - 1];
	    $scope.getHubById(hubId);
	}
    };

    //Init
    $scope.init();
}

//Modal Controller
var ModalCtrl = function($scope, $modalInstance, hub) {
    $scope.hub = hub;
    
    $scope.ok = function () {
	$modalInstance.close($scope.hub);
    };
    
    $scope.cancel = function () {
	$modalInstance.dismiss('cancel');
    };

};

//Login Controller
var LoginCtrl = function($scope, $location, ParseService){
    //Sign Up
    $scope.signUp = function(){
	ParseService.signUp($scope.signUp_username, $scope.signUp_password, function(user){
	    if(user != undefined){
		$location.path('/home');
		$scope.$apply();
	    }
	});
    }
    
    //Login
    $scope.login = function(){
	var username = $scope.login.username;
	var password = $scope.login.password;
	ParseService.login(username, password, function(user){
	    if(user != undefined){
		$location.path('/home');
		$scope.$apply();
	    }
	});
    }

    //Logout
    $scope.logout = function(){
	ParseService.logout();
    }

    //Init
    $scope.init = function(){
	$scope.logout()
    }

    $scope.init();
}
