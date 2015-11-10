alfredApp.controller('homeController', ['$scope', '$http', '$location', '$cookies', function($scope, $http, $location, $cookies) {
	
	// This is all the UI information

	/* Retrieves the email from the cookie when the document is loaded */
	angular.element(document).ready(function(){
		$scope.email = $cookies.get('email');
		$('#card').flip({
			trigger:'manual',
			axis:'y'
		})
	})

	$scope.toggledSidebar = true;


	/* This function redirects to the location based on the sidebar navigation */
	$scope.sidebarRedirect = function(loc){
		console.log("here");
		$location.path("/" + loc);
	}


	/* This function signs the user out */
	$scope.signOut = function(){
		$cookies.remove('email');
		$cookies.remove('lastSignIn');
		$location.path("/");
	}


	/* This function toogles the animation flip the main board */
	$scope.flip = function(){
		if($scope.canFlip){
			$('#card').flip('toggle');
		}
	}

	/* This function allows the sidebar to be displayed or not */
	$scope.toggleSidebar = function(){

		var sidebarWidth = $('.sidebar').width();

		if($scope.toggledSidebar){
			$('.sidebar').css('transform', 'translate(' + sidebarWidth +'px , 0%)');
			$('.header-sidebar').css('color', '#002635')
		} else {
			$('.sidebar').css('transform', 'translate(-' + sidebarWidth +'px , 0%)');
			$('.header-sidebar').css('color', 'white')
		}

		$scope.toggledSidebar = !$scope.toggledSidebar;

	}

	$scope.removeSidebar = function(){
		if($scope.toggledSidebar) return;
		$scope.toggleSidebar();
	}

	


	//This is all the implementation code

	/* This function initializes the Google Map to the users current coordinates */
	$scope.map = null;

	//Defaults to Champaign 
	$scope.lat = 40.1150;
	$scope.lon = -88.2728;
	$scope.coord = {};

	$scope.restaurants = [];
	$scope.infoWindow = null;

	/* This function gets the users coordinates from the browser */
	(function(){

		$scope.latestSearch = $cookies.get('lastSearch');
		$scope.canFlip = false;
		if(!navigator.geolocation){
			alert("Sorry, this browser does not support automatic geolocation");
			return;
		}
		navigator.geolocation.getCurrentPosition(function(position){
			$scope.lat = position.coords.latitude;
			$scope.lon = position.coords.longitude;
			$scope.coord = {
				lat: position.coords.latitude, 
				lng: position.coords.longitude
			}

			$cookies.put("lat", $scope.coord.lat)
			$cookies.put("lng", $scope.coord.lng)
			$scope.map = new google.maps.Map(document.getElementById('map'), {
				center: $scope.coord, 
				zoom: 14 
			});

			$scope.infoWindow = new google.maps.InfoWindow();

			$('#search').prop('disabled', false)
		});
	}());

	/* This function filters the text from the user to make it searchable */
	/* TODO: Allow this to handle multiple types of inputs */
	$scope.filterText = function(searchTest){
		var text = searchTest;

		if(text === ""){
			return false
		}

		text = text.toLowerCase();
		text = text.split(" ").join("+");

		return text;
	}

	/* This function properly structures the request to be sent to google places */
	$scope.getRequest = function(query){
		return {
			location: $scope.coord,
			radius: 500,
			query: query
		}
	}

	/* Tester Function */
	$scope.displayList = function(res){
		/*
		for(var i=0; i<res.length; i++){
			console.log(res[i]);
		}*/
	}

	/* This function generates the HTML to display the list of items searched */
	$scope.getInfoContent = function(restaurant){
		var retDOM = "<div class='infoWindow' ng-click='loadRestaurant(restaurant)'>";
				retDOM += "<div class='info-restaurant-name'>";
					retDOM += restaurant.name;
				retDOM += "</div>";
				retDOM += "<div class='info-restaurant-address'>";
					retDOM += restaurant.formatted_address;
				retDOM += "</div>";
				retDOM += "<div class='info-restaurant-rating'>";

					if(typeof restaurant.rating != 'undefined'){
						for(var starIndex=0; starIndex<Math.round(restaurant.rating); starIndex++){
							retDOM += "<i class='fa fa-star'></i>";
						}

						retDOM += "<span>(" + restaurant.rating + ")</span>";
					}
					
				retDOM += "</div>"
			retDOM += "</div>"

		return retDOM;
	}

	/* This function displays the indiviudal restaurants in the map */
	$scope.displayMarker = function(restaurant){
		var markerLocation = restaurant.geometry.location;
		var marker = new google.maps.Marker({
			map: $scope.map,
			position: markerLocation,
    		animation: google.maps.Animation.DROP,
		});
		
		google.maps.event.addListener(marker, 'click', function(){
			$scope.infoWindow.setContent($scope.getInfoContent(restaurant));
			$scope.infoWindow.open($scope.map, this);
		});
	}

	$scope.placeMarkers = function(res){
		var newLat = 0;
		var newLong = 0;

		for(var index=0; index<res.length; index++){
			var restaurant = res[index];
			
			newLat += restaurant.geometry.location.lat();
			newLong += restaurant.geometry.location.lng();

			$scope.displayMarker(restaurant);
		}

		var avgLat = newLat / res.length;
		var avgLong = newLong / res.length;
		
		$scope.map.setCenter({
			lat: avgLat,
			lng: avgLong
		});
	}

	/* This function sorts the restaurants based on the rating */
	$scope.filterRestaurants = function(res){
		var output = []
		for(var index=0; index<res.length; index++){
			output.push(res[index]);
		}

		output.sort(function(a, b){
			if (typeof a.rating == 'undefined') return 1;
			if (typeof b.rating == 'undefined') return -1;
			
			if(a.rating < b.rating){
				return 1
			}

			if (b.rating < a.rating){
				return -1
			}

			return 0
		})

		return output;
	}

	/* This function gets the callback from the places service */
	$scope.searchCallback = function(res, status){
		if (status != google.maps.places.PlacesServiceStatus.OK) { 
			alert("No Restaurants Found!");
			return;
		}

		$scope.restaurants = $scope.filterRestaurants(res);
		$scope.placeMarkers($scope.restaurants);
		$scope.displayList($scope.restaurants);
		$scope.canFlip = true;
	}

	/* This function gets called when the user searches for restaurants */
	$scope.searchRestaurants = function(){
		var query = $scope.filterText($scope.searchItem);

		$scope.latestSearch = $scope.searchItem;
		$cookies.put("lastSearch", $scope.latestSearch);

		if(!query){
			alert("Please enter a search parameter!");
			return;
		}

		var request = $scope.getRequest(query);
		$scope.service = new google.maps.places.PlacesService($scope.map);
		$scope.service.textSearch(request, $scope.searchCallback)

	}

	$scope.isOpen = function(open){
		if(open) return "Yes";
		return "No";
	}

	$scope.getNumber = function(num){
		len = Math.round(num)

		if(isNaN(num)){
			return;
		}
		return new Array(len);
	}

	$scope.loadRestaurant = function(res){
		var url = '/restaurant';
		$cookies.put("restaurantID", res.place_id);
		$cookies.put("restaurantName", res.name);

		$location.path(url);
	}

	$scope.repeat = function(){

		if(typeof $scope.latestSearch == "undefined") return;

		$scope.searchItem = $scope.latestSearch;
		$scope.searchRestaurants();
		$scope.canFlip = true;;
	}




}]);