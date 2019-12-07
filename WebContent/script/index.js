//API Keys
var mapBoxApiKey="pk.eyJ1IjoiYWxkb2FiZG4iLCJhIjoiY2pubHV5am93MDJnNzNxcXh3ZTVyOTY4dSJ9.JRxf6HQz9nb6XzJPhsX5zQ";
var openWeatherAPIKey="pk.eyJ1IjoiYWxkb2FiZG4iLCJhIjoiY2pubHV5am93MDJnNzNxcXh3ZTVyOTY4dSJ9.JRxf6HQz9nb6XzJPhsX5zQ";
var baseURL="api";
var id = null;
var user = {};
var map = null;

//Document Ready
try {
	$(function(){init()})
} catch (e){
	alert("jQuery not loaded");
}

//Initialise
function init() {
	//ID Modal
	$("#idModal").modal('show');
	//Login Click
	$("#loginButton").click(function(e){
		e.preventDefault();
		//Check ID Value
		id = $('#userID').val();
		//If valid hide model else show error
		if (id != ""){
			//Map Setup
			map = makeMap("map",1,0.0,0,0);
			//Clear Login
			$('#userID').val("");
			$('#idModalError').text("");
			//Show Loading Modal
			$("#idModal").modal('hide');
			$("#loadingModal").modal('show');
		    setUser();
		    //Delay as there seems to be a bug where modal('hide') doesn't work
		    setTimeout(function(){$('#loadingModal').modal('hide');},1000);
		} else {
			$('#idModalError').text("Invalid ID");
		}
	});
	
	//Logout Click 
	$("#logoutButton").click(function(){
		//Reset 
		id = "";
		map.remove();
		//Call to set user with blank user to clear all the user related data
		//Creates request errors and ID is blank
		setUser();
		//Show Login Modal
		$("#idModal").modal('show');
	});
	
	//Send Friend Request Click
	$("#sendRequestButton").click(function(e){
		e.preventDefault();
		var friendID = $('#friendRequestID').val();
		if (friendID=="" || friendID==user.id)
			return;
		//Start Loading
	    $('#loadingModal').modal('show');
		var url = baseURL + "/request";
		data = {"requesterID": user.id,"recipientID": friendID};
		$.post(url,data)
			.done(function(){
				//Reset Input Text
				$('#friendRequestID').val("");
				//Show Modals
				setTimeout(function(){
					//Finish Loading
					$('#loadingModal').modal('hide');
					//Show Notification
					setNotification("Friend Request", "Friend Request Sent");
					$('#notificationModal').modal('show');
				},1000);
			})
			.fail(function(){
				setTimeout(function(){
			    	//Finish Loading
			    	$('#loadingModal').modal('hide');
			    	//Show Notification
			    	setNotification("Error", "An error occured please try again later");
			    	$('#notificationModal').modal('show');
			    },1000);
			})
	});
	
	//Approve Click 
	$(document).on("click",'.approveRequestButton',function(){
		//Start Loading
		$('#loadingModal').modal('show');
		//Delete Request
		listItem = $(this).parent();
		span = listItem.find("span");
		requesterID = span.text();
		data = {"requesterID":requesterID};
		var url = baseURL + "/request/" + user.id +"?requesterID=" + requesterID;
		$.ajax({
			url:url,
			type:'DELETE',
			success: function(results){
				//Create Subscription
				url = baseURL + "/subscription";
				subscriberID = requesterID;
				//Subscribe both parties to each other
				data = {"subscriberID":subscriberID,"subscriptionID":user.id};
				$.post(url,data,function(){
				    setTimeout(function(){
				    	//Finish Loading
				    	$('#loadingModal').modal('hide');
				    	//Show Notification
				    	setNotification("Friend Request", "Friend Request Approved");
				    	$('#notificationModal').modal('show');
				    },1000);
				}).fail(function(){
					setTimeout(function(){
				    	//Finish Loading
				    	$('#loadingModal').modal('hide');
				    	//Show Notification
				    	setNotification("Error", "An error occured please try again later");
				    	$('#notificationModal').modal('show');
				    },1000);
				});
				//Subscribe user to requester
				dataReturn = {"subscriberID":user.id,"subscriptionID":subscriberID};
				$.post(url,dataReturn,function(){
					setSubscription();
					setLocation();
				}).fail(function(){
					setTimeout(function(){
				    	//Finish Loading
				    	$('#loadingModal').modal('hide');
				    	//Show Notification
				    	setNotification("Error", "An error occured please try again later");
				    	$('#notificationModal').modal('show');
				    },1000);
				});;
			},
			error: function(results){
			    setTimeout(function(){
			    	//Finish Loading
			    	$('#loadingModal').modal('hide');
			    	//Show Notification
			    	setNotification("Error", "An error occured please try again later");
			    	$('#notificationModal').modal('show');
			    },1000);
			}
		})
	});
	
	//Deny Click
	$(document).on('click','.denyRequestButton',function(){
		//Start Loading
		$('#loadingModal').modal('show');
		//Delete Request
		listItem = $(this).parent();
		span = listItem.find("span");
		requesterID = span.text();
		var url = baseURL + "/request/" + user.id + "?requesterID=" + requesterID;
		$.ajax({
			url:url,
			type:'DELETE',
			success: function(results){
				setSubscription();
			    setTimeout(function(){
			    	//Finish Loading
			    	$('#loadingModal').modal('hide');
			    	//Show Notification
			    	setNotification("Friend Request", "Friend Request Denied");
			    	$('#notificationModal').modal('show');
			    },1000);
			},
			error: function(results){
			    setTimeout(function(){
			    	//Finish Loading
			    	$('#loadingModal').modal('hide');
			    	//Show Notification
			    	setNotification("Error", "An error occured please try again later");
			    	$('#notificationModal').modal('show');
			    },1000);
			}
		})
	});
	
	//Friend Click
	$(document).on('click','.friend',function(){
		//Focus map on friends marker 
		map.setView(L.latLng($(this).data('lat'),$(this).data('long')),map.getZoom());
	});
	
	//Check In Click
	$('#checkInButton').click(function(){
		//Start Loading
		$('#loadingModal').modal('show');
		var url = baseURL + "/location";
		var lat = user.marker.getLatLng().lat
		var long = user.marker.getLatLng().lng
		data = {
				"id":user.id,
				"longitude": long,
				"latitude": lat
		}
		$.post(url,data)
			.done(function(){
				$('#lastCheckIn').text("Lat: " + lat + " Long: " + long);
				setTimeout(function(){
					//Finish Loading
					$('#loadingModal').modal('hide');
		    		//Show Notification
		    		setNotification("Checked In", "You checked in at Lat: " + lat + " Long: " + long);
		    		$('#notificationModal').modal('show');
				},1000);
			})
			.fail(function(xhr,status,error){
				setTimeout(function(){
					//Finish Loading
					$('#loadingModal').modal('hide');
		    		//Show Notification
		    		setNotification("Error", "An error occured please try again later");
		    		$('#notificationModal').modal('show');
				},1000);
			});
	});
}

//Set User
function setUser(){
	//Set Attributes
	user.id = id;
	//Set Map Marker
	url = baseURL + "/location/"+user.id;
        alert(url);
	$.getJSON(url,function(jsonData){
		user.marker = makeMarker(map,jsonData['longitude'],jsonData['latitude'],user.id,true,colouredIcon('#32CD32'));
		$('#lastCheckIn').text("Lat: " + jsonData['latitude'] + " Long: " + jsonData['longitude']);
	}).fail(function(){
		user.marker = makeMarker(map,0,0,user.id,true,colouredIcon('#32CD32'));
		$('#lastCheckIn').text("Lat: 0 Long: 0");
	});
	//Set Cards
	setProfile();
	setSubscription();
	setLocation();
}

//Set Profile Card
function setProfile(){
	//Set Username
	$("#username").text(user.id);
}

//Set Subscription Management Card
function setSubscription(){
	var friendRequests = [];
	var url = baseURL+"/request/"+user.id;
	//Clear List
	$('#requests').empty();
	//Get Friend Requests 
	$.getJSON(url,function(jsonData){
		friendRequests = jsonData;
		//Set Friend Request List
		for(var request of friendRequests){
			$("#requests").append("<li class='list-group-item'><span>" + request.requesterID + "</span><button class='approveRequestButton btn-success btn float-right'>Approve</button><button class='denyRequestButton btn-danger btn float-right'>Deny</button></li>");
		} 
	});
}

//Set Location Management Card
function setLocation(){
	var friendsList = [];
	var url = baseURL + "/subscription/" + user.id;
	//Clear List
	$('#friendsList').empty();
	//Set Friends List 
	$.getJSON(url,function(jsonData){
		friendsList = []
		//Convert Subscriptions to Friends
		for(var subscription of jsonData){
			let friend = {id:subscription.subscriptionID};
			friendsList.push(friend);
		}
		//Get locations of friends and create list
		$.each(friendsList,function(i,friend){
			url = baseURL + "/location/"+friend.id;
			$.getJSON(url,function(jsonData){
				friend.marker = makeMarker(map,jsonData['longitude'],jsonData['latitude'],friend.id,false,colouredIcon('#0000FF'));
				$('#friendsList').append("<button class='list-group-item list-group-item-action friend' data-lat='" + jsonData['latitude'] + "' data-long='" + jsonData['longitude'] + "'>" + friend.id + "</button>");
			}).fail(function(){
				friend.marker = makeMarker(map,0,0,friend.id,false,colouredIcon('#0000FF'));
				$('#friendsList').append("<button class='list-group-item list-group-item-action friend' data-lat='" + 0 + "' data-long='" + 0 + "'>" + friend.id + "</button>");
			});
		});
	});
}

//Set Notification Modal
function setNotification(title,body){
	$('#notificationModalTitle').text(title);
	$('#notificationModalBody').text(body);
}

//Map Functions 
function makeMap(divId,zoomLevel,longitude,latitude) {
	var location=L.latLng(longitude,latitude);		//create location
	var map=L.map(divId).setView(location,zoomLevel);	//put map into division
	L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token='+mapBoxApiKey,
		{attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
		maxZoom: 18,
		id: 'mapbox.streets',
		accessToken: mapBoxApiKey}
	).addTo(map);
	return map;	//return map object
} //end function

//
//create a marker on a map
//the marker is returned as we need to get its position later
//
function makeMarker(map,longitude,latitude,title="",draggable=true,icon=L.Icon.Default){
	var location=L.latLng({lon:longitude,lat:latitude});	//create marker at given position
	var marker=L.marker(location,{title:title,draggable:draggable,icon:icon});			//make a draggable marker
	marker.addTo(map);										//add marker to map
	return marker;	//return marker object
} //end function

//Custom Leaflet Marker
//https://stackoverflow.com/questions/23567203/leaflet-changing-marker-color
function colouredIcon(colour){
	//Set Icon Style
	var markerHtmlStyles = `
	  background-color: ${colour};
	  width: 1.5rem;
	  height: 1.5rem;
	  display: block;
	  left: -1.5rem;
	  top: -1.5rem;
	  position: relative;
	  border-radius: 3rem 3rem 0;
	  transform: rotate(45deg);
	  border: 1px solid #FFFFFF`

	//Create Icon
	var icon = L.divIcon({
	  className: "my-custom-pin",
	  iconAnchor: [0, 24],
	  labelAnchor: [-6, 0],
	  popupAnchor: [0, -36],
	  html: `<span style="${markerHtmlStyles}" />`
	})
	return icon
}

