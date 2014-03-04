Parse.Cloud.define("getQueuedSongsByHubId", function(request, response) {
    var Hub = Parse.Object.extend("Hub");
    var query = new Parse.Query(Hub);
    query.get(request.params.hubId, {
	success: function(hub){
	    var QueuedSong = Parse.Object.extend("QueuedSong");
	    var query = new Parse.Query(QueuedSong);
	    query.limit(1000);
	    query.include('song');
	    query.include('hub');
	    query.equalTo('hub', hub);
	    query.find({
		success: function(results){
		    console.log(results.length);    
		    if(results.length > 0){
			
			//comparator for queuedSong.position
			function compare(a,b) {
			    if (a.get('position') < b.get('position'))
				return 1;
			    if (a.get('position') > b.get('position'))
				return -1;
			    return 0;
			}

			var hubDate = (results[0].get('hub').createdAt.getTime()) / 1000;
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
			    
			    var seconds = (song.createdAt.getTime() / 1000) - hubDate;
			    var position = Math.round(sign * order + seconds / 23000); 
			    console.log(position);
			    song.set('position', position);
			    song.set('score', s);
			});
			
			Parse.Object.saveAll(results, {
			    success: function(results){
				//Sort results on newly calculated position
				results.sort(compare);
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

