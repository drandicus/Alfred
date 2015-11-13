alfredApp.controller('restaurantController', ['$scope', '$http', '$location', '$cookies', '$routeParams', function($scope, $http, $location, $cookies, $routeParams) {
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

	/* Functionality Begins Here */
	$scope.displayYelpSnippet = function(yelp){
		var html = "<h3>Yelp Review</h3>"
			html += "<div class='google-review'>"
				html += "<p>" + yelp.user.name + " says: </p>"
				html += "<p class='padding-left:10px'>" + yelp.excerpt + "</p>"
				html += "<p><b>Rating:</b> " + yelp.rating + "</p>"
			html += "</div>"


			html += "<p>For more information, search on</p>"
			html += "<a href='http://yelp.com'><img src='images/yelp.jpg' class='yelp'/></a>"

		$('#yelpReviews').html(html);
	}

	/* This function accesses the Yelp API stored in the server */
	$scope.accessYelp = function(){
		var res = $http.post("/api/yelp", $scope.place);
		res.success(function(response){
			$scope.displayYelpSnippet(response);
		})
	}

	/* This function generates the html for the google reviews */
	$scope.displayGoogleReviews = function(){
		var reviews = $scope.place.reviews;
		var html = "<h3>Google Reviews</h3>"
		html += "<p><b>Google Rating: </b>" + $scope.place.rating + "</p>";

		for(var reviewIndex =0; reviewIndex < reviews.length; reviewIndex ++){
			var review = reviews[reviewIndex];
			html += "<div class='google-review'>"
				html += "<p>" + review.author_name + " says: </p>"
				html += "<p class='padding-left:10px'>" + review.text + "</p>"
				html += "<p><b>Rating:</b> " + review.rating + "</p>"
			html += "</div>"
		}


		return html;
	}

	/* This function generates the html for the schedule portion of the information */
	$scope.displaySchedule = function(){
		if(typeof $scope.place.opening_hours == "undefined") return;

		var html = "<p><b>Status: </b> " + ($scope.place.opening_hours.open_now ? "Open" : "Closed" ) + "</p>";
		html += "<p><b>Schedule: </b></p>"

		for(var day=0; day < $scope.place.opening_hours.weekday_text.length; day++){
			html += "<p>"
				html += $scope.place.opening_hours.weekday_text[day];
			html += "</p>"
		}

		return html;
	}

	/* This function renders the basic information about websites */
	$scope.renderInformation = function(){

		var html = "";
		html += "<p><b>Address: </b>" + $scope.place.formatted_address + "</p>";
		html += "<p><b>Phone Number: </b>" + $scope.place.formatted_phone_number + "</p>";
		html += "<p><b>Website: </b><a href='" + $scope.place.website + "'>" + $scope.place.website + "</a></p>";
		html += $scope.displaySchedule();


		return html;
	}

	$scope.displayInformation = function(){
		$('#placeInformation').html($scope.renderInformation());
		$('#googleReviews').html($scope.displayGoogleReviews());
		$scope.accessYelp();
	}

	$scope.successCallback = function(place, status) {
		if(status !== google.maps.places.PlacesServiceStatus.OK){
			return;
		}

		$scope.loaded = true;
		$scope.place = place;

		var marker = new google.maps.Marker({
			map: $scope.map,
			position: place.geometry.location
		});

		$scope.map.setCenter(place.geometry.location)

		$scope.displayInformation();
	    
	}


	angular.element(document).ready(function(){
		$scope.email = $cookies.get('email');
		$scope.restaurantID = $cookies.get('restaurantID');
		$scope.restaurantName = $cookies.get('restaurantName');

		if($scope.restaurantID == null){
			$location.path("/home");
		}
		$scope.place = null;
		$scope.loaded = false;
		$scope.address = "Not Found";
		
		$scope.coord = {
			lat: parseInt($cookies.get("lat")),
			lng: parseInt($cookies.get("lng"))
		};

		$scope.map = new google.maps.Map(document.getElementById('map'), {
			center: $scope.coord, 
			zoom: 14 
		});

		$scope.service = new google.maps.places.PlacesService(map);

		$scope.service.getDetails({
		    placeId: $scope.restaurantID
		}, $scope.successCallback);
	})

}]);