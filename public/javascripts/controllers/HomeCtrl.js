alfredApp.controller('homeController', ['$scope', '$http', '$location', '$cookies', '$rootScope', function($scope, $http, $location, $cookies, $rootScope) {
	
	// This is all the UI information

	/* Retrieves the email from the cookie when the document is loaded */
	angular.element(document).ready(function(){
		$scope.email = $cookies.get('email');
		$scope.name = $cookies.get('name');
		$('#card').flip({
			trigger:'manual',
			axis:'y'
		})
	})

	$scope.toggledSidebar = true;


	/* This function redirects to the location based on the sidebar navigation */
	$scope.sidebarRedirect = function(loc){
		$scope.$apply($rootScope.sidebarRedirect($location, loc));
	}

	/* This function signs the user out */
	$scope.signOut = function(){
		$rootScope.signOut($cookies, $location);
	}

	/* This function toogles the animation flip the main board */
	$scope.flip = function(){
		$rootScope.flip($scope);
	}

	/* This function allows the sidebar to be displayed or not */
	$scope.toggleSidebar = function(){
		$rootScope.toggleSidebar($scope);
	}

	$scope.removeSidebar = function(){
		$rootScope.removeSidebar($scope);
	}

	//----------------------------------------------------------
	//This is all the implementation code

	/* This function initializes the Google Map to the users current coordinates */
	$scope.map = null;

	//Defaults to Champaign 
	$scope.lat = 40.1150;
	$scope.lon = -88.2728;
	$scope.coord = {};

	$scope.restaurants = [];
	$scope.infoWindow = null;
	$scope.arrayOfMarkers = [];

	/* This function gets the users coordinates from the browser */
	angular.element(document).ready(function(){

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
	});

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

		$scope.arrayOfMarkers.push(marker);
		
		google.maps.event.addListener(marker, 'click', function(){
			$scope.infoWindow.setContent($scope.getInfoContent(restaurant));
			$scope.infoWindow.open($scope.map, this);
		});
	}

	$scope.placeMarkers = function(res){
		var newLat = 0;
		var newLong = 0;

		$scope.clearMarkers();

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
	$scope.searchRestaurants = function(query){
		$scope.latestSearch = $scope.searchItem;
		$cookies.put("lastSearch", $scope.latestSearch);

		var request = $scope.getRequest(query);
		$scope.service = new google.maps.places.PlacesService($scope.map);
		$scope.service.textSearch(request, $scope.searchCallback)
	}


	/* This function translates trua or false to "Yes" or "No" */
	$scope.isOpen = function(open){
		if(open) return "Yes";
		return "No";
	}


	/* This function creates an array of the number size */
	$scope.getNumber = function(num){
		var len = Math.round(num)

		if(isNaN(num)){
			return;
		}
		return new Array(len);
	}

	/* This function runs the last search made by the user */
	$scope.repeat = function(){
		if(typeof $scope.latestSearch == "undefined") return;

		$scope.searchItem = $scope.latestSearch;
		$scope.searchRestaurants($scope.searchItem);
		$scope.canFlip = true;;
	}

	//----------------------------------------------------------------------------------------//
	/* This section is for the web-recognition software */
	
	$scope.recognizing = false;
	$scope.finalTranscript = "";
	$scope.recognition = null;


	/**
		This function is called when the user hits the microphone button,
		It starts the diction process 
	*/
	$scope.startRecording = function(){
		if($scope.recognizing){
			$scope.recognition.stop();
			return;
		}

		$scope.searchItem = "";
		$scope.recognition.lang = 'en-US';
		$scope.recognition.start();
	}

	/**
		This function starts the voice recognition software
		It is the callback for when it decides to appear 
	*/
	$scope.recognitionOnStart = function(){
		$scope.recognizing = true;
	}

	/**
		This function is the one the voice recognizer api calls
		when it done with the result
	*/
	$scope.recognitionOnResult = function(event) {
		$scope.searchItem = "";
		for(var wordIndex = event.resultIndex; wordIndex < event.results.length; wordIndex ++){
			 $scope.searchItem += event.results[wordIndex][0].transcript
			 $('#searchItem').val($scope.searchItem);
		}
			
	}

	/**
		This function is the one the voice recognizer calls when there is an error
		with the recognition process
	*/
	$scope.recognitionOnError = function(event) {
		var errorMessage = "";
		if(event.error == "no-speech"){
			errorMessage = "No Speech Available";
		} else if (event.error == "audio-capture"){
			errorMessage = "Audio Capture not working";
		} else if (event.error == "not-allowed"){
			errorMessage = "Voice Recognizer not allowed on this computer";
		}

		alert(errorMessage);
	}
	/**
		This is the function the voice recognizer calls when it is down with the transcripting
		process
	*/
	$scope.recognitionOnEnd = function(){
		$scope.recognizing = false;
		$scope.inputCommand();
	}


	/* This portion initializes the webkit software */
	angular.element(document).ready(function(){
		if (!('webkitSpeechRecognition' in window)) {
		 	alert("Voice Command Software is not available in this platform. Our apologies.");
		} else {
			$scope.recognition = new webkitSpeechRecognition();
			
			$scope.recognition.continuous = false;
			$scope.recognition.interimResults = false;

			$scope.recognition.onstart = $scope.recognitionOnStart;
			$scope.recognition.onresult = $scope.recognitionOnResult;
			$scope.recognition.onerror = $scope.recognitionOnError;
			$scope.recognition.onend = $scope.recognitionOnEnd;
		}
	})

	/* This function filters the text from the user to make it searchable */
	$scope.filterText = function(searchTest){
		if(searchTest === "") return false

		var text = searchTest.toLowerCase();
		var command = $scope.findCommand(text);
		var query = "";
		var auxilary = null;

		if(!command) return false;
		else if(command == "find"){
			query = text.split(" ").join("+");
			auxilary = $scope.findSpecifier(text);

		} else if (command == "navigate"){
			query = $scope.findPage(text)
			if(!query) return null;
		}

		return {
			"action": command,
			"query": query,
			"auxilary": auxilary
		}
	}

	/* 
		This function finds the action command the user wants Alfred to do.
		It does this by scanning the text and finding the first instance of the action command
	*/
	$scope.findCommand = function(text){
		var searchCommands = ["find", "locate", "search", "discover"];
		var navigateCommands = ["go", "navigate"];

		var words = text.split(" ");

		if(text.indexOf("sign out") > -1){
			return "sign out";
		}

		for(wordIndex = 0; wordIndex < words.length; wordIndex ++){
			if(searchCommands.indexOf(words[wordIndex]) > -1){
				return "find";
			} else if(navigateCommands.indexOf(words[wordIndex]) > -1){
				return "navigate";
			}

		}

		return "find";
	}

	/**
		This function finds the specifier ie. "best", etc. in the users query
		and helps filter the result
	*/
	$scope.findSpecifier = function(text){
		var specifierWords = ['best', 'worst', 'random'];

		var words = text.split(" ");
		
		for(wordIndex = 0; wordIndex < words.length; wordIndex ++){
			if(specifierWords.indexOf(words[wordIndex]) > -1){
				return words[wordIndex];
			} 
		}
	}

	/*
		This function attempts to identify which page the user wants to navigate too
	*/
	$scope.findPage = function(text){
		var pages = ["last", "profile", "settings", "home", "favorites"];
		var words = text.split(" ");
		for(wordIndex = 0; wordIndex < words.length; wordIndex ++){
			if(pages.indexOf(words[wordIndex]) > -1){
				if(words[wordIndex] == "last"){
					return "restaurant";
				}

				return words[wordIndex] ;
			}
		}

		return null
	}

	/*
		This function dynamically removes all of the markers from the map
	*/
	$scope.clearMarkers = function(){
		for(var index=0; index<$scope.arrayOfMarkers.length; index++){
			$scope.arrayOfMarkers[index].setMap(null);
		}
	}

	/*
		This function is for when Alfred has an auxilary command
	*/
	$scope.auxilarySearch = function(auxilary, query){
		$scope.latestSearch = $scope.searchItem;
		$cookies.put("lastSearch", $scope.latestSearch);

		var request = $scope.getRequest(query);
		$scope.service = new google.maps.places.PlacesService($scope.map);
		$scope.service.textSearch(request, function(res, status){
			if(status != google.maps.places.PlacesServiceStatus.OK){
				alert("No Restaurants Found!");
				return;
			}

			var restaurants = $scope.filterRestaurants(res);
			$scope.finishCommand(restaurants, auxilary);
		});
	}

	/*
		This function finishes the auxilary command by selecting the area by the choice the user made
		and displays it in the page
	*/
	$scope.finishCommand = function(restaurants, auxilary, query){
		var index = 0;
		if(auxilary === "best"){
			index = 0;
		} else if(auxilary === "worst"){
			index = restaurants.length - 1;
		} else {
			index = Math.floor(Math.random() * restaurants.length);
		}
		$scope.loadRestaurant(restaurants[index], query)
		$scope.$apply();


	}

	/* 
		This function is executed when the user sends a command in either through the textbox or through
		the voice module 
	*/
	$scope.inputCommand = function(){
		var query = $scope.filterText($scope.searchItem);

		$scope.command = query;
		if(!query) return;
		else if(query["action"] == "find"){

			if(typeof query['auxilary'] === "undefined") $scope.searchRestaurants(query["query"]);
			else $scope.auxilarySearch(query['auxilary'], query['query']);

		} else if(query["action"] == "navigate"){

			$scope.sidebarRedirect(query["query"]);

		} else if (query['action'] == "sign out"){
			
			$scope.signOut();
		
		}
	}

	/* This function redirects the user to the desired page */
	$scope.loadRestaurant = function(res){
		var url = '/restaurant';
		$cookies.put("restaurantID", res.place_id);
		$cookies.put("restaurantName", res.name);

		$scope.$apply($location.path(url));
		
	}

}]);