alfredApp.controller('profileController', ['$scope', '$http', '$location', '$cookies', '$rootScope', function($scope, $http, $location, $cookies, $rootScope) {

	/* Classic UI Elements */

	$scope.toggledSidebar = true;

	/* This function redirects to the location based on the sidebar navigation */
	$scope.sidebarRedirect = function(loc){
		$scope.$apply($rootScope.sidebarRedirect($location, loc));
	}

	/* This function signs the user out */
	$scope.signOut = function(){
		$rootScope.signOut($cookies, $location);
	}

	/* This function allows the sidebar to be displayed or not */
	$scope.toggleSidebar = function(){
		$rootScope.toggleSidebar($scope);
	}

	$scope.removeSidebar = function(){
		$rootScope.removeSidebar($scope);
	}

	/* Implementaion */

	$scope.placeIndex = 0;
	$scope.places = []
	$scope.page = 0;
	$scope.userProfile = null;
	$scope.chosenOne = null;


	/* This function redirects the user to the desired page */
	$scope.loadRestaurant = function(res){
		var url = '/restaurant';
		$cookies.put("restaurantID", res.place_id);
		$cookies.put("restaurantName", res.name);

		var data = {
			email: $scope.email,
			restaurantID: res.place_id
		}

		$http.post("/api/saveResult", data).then(function(data, status){
			if(data.data == "Success"){
				$scope.$apply($location.path(url));
			}
		}, function(){
			$scope.$apply($location.path(url));
		})
		
	}

	/*
		This function handles the callback from the api call to like or dislike a photo
		It handles the tolerance meter
		It reloads the UI and updates the model.
	*/
	$scope.placeLikeCallback = function(newItem, like){
		$scope.visited.push(newItem);

		for(var index=0; index<$scope.predictedLike.length; index++){
			if($scope.predictedLike[index].place_id == newItem.place && !like){
				$scope.tolerance += 0.01
			}
		}

		for(var index=0; index<$scope.predictedDislike.length; index++){
			if($scope.predictedDislike[index].place_id == newItem.place && like){
				$scope.tolerance -= 0.01
			}
		}

		$cookies.put('tolerance', $scope.tolerance);

		$scope.userProfile = $scope.buildUserProfile($scope.visited, $scope.liked);
		$scope.processResults();
		$scope.loadNearby();
		$scope.loadLikes();
		$scope.loadDislikes();
	}

	/*
		This function is called when the liked button is clicked on a particular place
	*/
	$scope.placeLike = function(like){
		var data = {
			user: $scope.email,
			place: $scope.chosenOne.place_id,
			type: []
		}

		if(typeof $scope.chosenOne.rating != "undefined"){
			data.rating = $scope.chosenOne.rating;
		}

		if(typeof $scope.chosenOne.types != "undefined"){
			data.type = $scope.chosenOne.types;
		}

		var url = "/api/";
		url += like ? "like" : "dislike";

		$http.post(url, data).then(function(res, status){
			$scope.placeLikeCallback(data, like);
		}, function(res, status){
			$scope.placeLikeCallback(data, like);
		})
	}


	/*
		This function gets the exact details of a place,
		it parses the object given by google and defaults if necessary
	*/
	$scope.getDetailsOfPlace = function(place){
		var details = {
			name: "",
			vicinity: "",
			photo: ""
		}

		if(typeof place.photos != "undefined"){
			details.photo = place.photos[0].getUrl({'maxWidth': 200, 'maxHeight': 200})
		}

		if(typeof place.name != "undefined"){
			details.name = place.name;
		}

		if(typeof place.vicinity != "undefined"){
			details.vicinity = place.vicinity;
		}
		
		return details;
	}

	$scope.displayEmpty = function(){
		alert("All nearby places explored");

	}

	/*
		This function starts the chain that loads the nearby functions that are yet unvisited by the user
	*/
	$scope.loadNearby = function(){
		if($scope.unvisitedPlaces.length == 0){
			return $scope.displayEmpty();
		}

		var place = $scope.unvisitedPlaces.pop();
		var details = $scope.getDetailsOfPlace(place)

		$scope.chosenOne = place;

		$(".profile-visited").css('background-image', 'url(' + details.photo + ')');
		$('#profile-visited-text').html("");
		$('#profile-visited-text').append("<h3>" + details.name + "</h3>");
		$('#profile-visited-text').append("<p>" + details.name + "</p>");
		$('#profile-visited-like').css("opacity", "1");

		$('.profile-visited').click(function(){
			$scope.loadRestaurant(place);
		})

		$('#profile-main-waiting').remove();
	}

	/*
		This function loads some of the liked places into the html
	*/
	$scope.loadLikes = function(){
		var html = "";
		if($scope.predictedLike.length == 0){
			html += "<p>Alfred has not found a place near you that you may like</p>";
		} else {
			var place = $scope.predictedLike[Math.floor(Math.random() * $scope.predictedLike.length)];
			html += "<h5>" + place.name + "</h5>";
			html += "<p>" + place.vicinity + "</p>";
		}

		$('#profile-place-like').html("");
		$('#profile-place-like').append(html);
	}

	/*
		This function loads some of the disliked places into the HTML
	*/
	$scope.loadDislikes = function(){
		var html = "";
		if($scope.predictedDislike.length == 0){
			html += "<p>Alfred has not found a place near you that you may like</p>";
		} else {
			var place = $scope.predictedDislike[Math.floor(Math.random() * $scope.predictedDislike.length)];
			html += "<h5>" + place.name + "</h5>";
			html += "<p>" + place.vicinity + "</p>";
		}

		$('#profile-place-dislike').html("");
		$('#profile-place-dislike').append(html);
	}

	/*
		This function checks to see if the user would like this particular restaurant
		based on the user model created.

		In the future, there will much more added to this, but for now a rudimentary version
		should do.
	*/
	$scope.processResult = function(place){
		var types = place.types;

		var score = 0;
		for(var index=0; index<types.length; index++){
			if($scope.userProfile.aggregateLikedTypes.indexOf(types[index]) != -1){
				score ++;
			}

			if($scope.userProfile.aggregatedDislikedTypes.indexOf(types[index]) != -1){
				score --;
			}

			if(place.rating > $scope.userProfile.meanLikedRating){
				score ++;
			}
		}

		//Accounts for random tolerance
		if(score == 0){
			var chance = Math.random();
			if(chance > $scope.tolerance){
				score ++;
			} else {
				score --
			}
		}

		if(score > 0){
			return "LIKE";
		} 

		return 'DISLIKE';
	}

	/*
		This function finds all of the places nearby that are unvisited
	*/
	$scope.findUnvisited = function(){
		var visitedIDs = [];
		
		for(var index=0; index<$scope.visited.length; index ++){
			visitedIDs.push($scope.visited[index].place);
		}

		var unvisitedPlaces = [];
		for(var index=0; index<$scope.places.length; index ++){
			if (visitedIDs.indexOf($scope.places[index].place_id) == -1){
				unvisitedPlaces.push($scope.places[index]);
			}
		}

		return unvisitedPlaces;
	}

	/*
		This function processes all the restaurants into whether they are
		liked or disliked based on the classifier
	*/
	$scope.processResults = function(){

		$scope.unvisitedPlaces = $scope.findUnvisited();
		$scope.predictedLike = [];
		$scope.predictedDislike = [];

		for(var index=0; index<$scope.unvisitedPlaces.length; index++){
			var status = $scope.processResult($scope.unvisitedPlaces[index]);
			if(status === "LIKE"){
				$scope.predictedLike.push($scope.unvisitedPlaces[index]);
			} else {
				$scope.predictedDislike.push($scope.unvisitedPlaces[index]);
			}
		}
	}

	/*
		This function gets the results of the Google Nearby search and
		starts the processing and classification.
	*/
	$scope.getGoogleResults = function(res, status, pagination){

		if (status == google.maps.places.PlacesServiceStatus.OK) {
			$scope.places = res;

			if(pagination.hasNextPage){
				var moreButton = document.getElementById('loadMore');
				moreButton.disabled = false;

				moreButton.addEventListener('click', function() {
					moreButton.disabled = true;
					pagination.nextPage();
				});
			}
			$scope.processResults();
			$scope.loadNearby();
			$scope.loadLikes();
			$scope.loadDislikes();
		}
	}

	/*
		This function is a simple helper function that finds the mean rating
	*/
	$scope.findMean = function(arr){
		var total = 0;
		for(var index = 0; index<arr.length; index++){
			total += arr[index].rating;
		}

		return total/arr.length;
	}


	/*
		This function builds a simple classifier based on the users information
		The information is calculated through the data the user inputed
	*/
	$scope.buildUserProfile = function(visited, liked){
		var userProfile = {
			meanLikedRating: -1,
			aggregateLikedTypes: [],
			aggregatedDislikedTypes: []
		}

		var types = {};


		for(var likeIndex = 0; likeIndex < visited.length; likeIndex ++){
			var visitedTypes = visited[likeIndex].type;

			var adder = visited[likeIndex].liked == true ? 1 : -1
			for(var typeIndex = 0; typeIndex < visitedTypes.length; typeIndex++){
				if(visitedTypes[typeIndex] in types){
					types[visitedTypes[typeIndex]] += adder;
				} else {
					types[visitedTypes[typeIndex]] = adder;
				}
			}
		}

		console.log(types);

		for(var type in types){
			if(types.hasOwnProperty(type)){
				if(types[type] > 0){
					userProfile.aggregateLikedTypes.push(type);
				} else {
					userProfile.aggregatedDislikedTypes.push(type);
				}
			}
		}

		userProfile.meanLikedRating = $scope.findMean($scope.liked);

		return userProfile;

	}

	/*
		This function parses the raw data from the server into
		3 lists and then calls the function to build the user profile as
		and then calls the function to call the data from google to list
	*/	
	$scope.parseData = function(data){
		$scope.liked = [];
		$scope.disliked = [];
		$scope.visited = [];

		for(var i=0; i<data.length; i++){
			$scope.visited.push(data[i]);
			if(data[i].liked){
				$scope.liked.push(data[i]);
			} else {
				$scope.disliked.push(data[i]);
			}
		}

		$scope.userProfile = $scope.buildUserProfile($scope.visited, $scope.liked);

		var request = {
			location: new google.maps.LatLng($scope.coord.lat, $scope.coord.lng),
			radius: 500
		}

		$scope.service = new google.maps.places.PlacesService($scope.map);
		$scope.service.nearbySearch(request, $scope.getGoogleResults);
	}


	/* 
		Starts up the page
		Gets the information from the cookies and starts loading the data
		from google and the server
	*/
	angular.element(document).ready(function(){
		$scope.email = $cookies.get('email');
		$scope.name = $cookies.get('name');

		$scope.coord = {
			lat: parseFloat($cookies.get('lat')),
			lng: parseFloat($cookies.get('lng'))
		}

		$scope.map = new google.maps.Map(document.getElementById("map"), {
			center: $scope.coord
		})

		$scope.tolerance = $cookies.get('tolerance');
		if(typeof $scope.tolerance == "undefined"){
			$scope.tolerance = 0.5
		}

		$http.post("/api/userInformation", {
			email: $scope.email
		}).then(function(data, status){
			$scope.parseData(data.data);
		})
		
	});


	/*
		Here is my Jasmine Testing. It is here because putting it elsewhere is the worst thing in th world and makes
		my life insanely complicated.

		For some reason, Jasmine only runs a fraction of the time. Therefore if it shows 0 specs run, keep refreshing.
		This is a bug I do not know how to fix.
	*/
	describe("Building User Profile Test", function(){

		it("should have 0 liked and 5 disliked on this run", function(){
			var testData = [
				{
					place: "1",
					type: ["a", "c"],
					liked: true
				},
				{
					place: "2",
					type: ["d", "e", "f"],
					liked: true
				},
				{
					place: "3",
					type: ["a", "c", "d"],
					liked: false
				},
				{
					place: "4",
					type: ["a", "e", "f"],
					liked: false
				}
			];
			var userProfile = $scope.buildUserProfile(testData, []);
			expect(userProfile.aggregateLikedTypes.length).toBe(0);
			expect(userProfile.aggregatedDislikedTypes.length).toBe(5);
		})

		it("should have 6 liked and 0 disliked on this run", function(){
			var testData = [
				{
					place: "1",
					type: ["a", "b", "c"],
					liked: true
				},
				{
					place: "2",
					type: ["d", "e", "f"],
					liked: true
				},
				{
					place: "3",
					type: ["a", "c", "d"],
					liked: true
				},
				{
					place: "4",
					type: ["a", "e", "f"],
					liked: true
				}
			];
			var userProfile = $scope.buildUserProfile(testData, []);
			console.log(userProfile)
			expect(userProfile.aggregateLikedTypes.length).toBe(6);
			expect(userProfile.aggregatedDislikedTypes.length).toBe(0);
		})

		it("should have 3 liked and 3 disliked on this run", function(){
			var testData = [
				{
					place: "1",
					type: ["a", "b", "c"],
					liked: true
				},
				{
					place: "2",
					type: ["d", "e", "f"],
					liked: false
				},
				{
					place: "3",
					type: ["a", "c", "b"],
					liked: true
				},
				{
					place: "4",
					type: ["d", "e", "f"],
					liked: false
				}
			];
			var userProfile = $scope.buildUserProfile(testData, []);
			console.log(userProfile);
			expect(userProfile.aggregateLikedTypes.length).toBe(3);
			expect(userProfile.aggregatedDislikedTypes.length).toBe(3);
		})
	});

	describe("Get Details of a place properly", function(){

		it("should check for undefined name", function(){
			var details = $scope.getDetailsOfPlace({
				vicinity: "a",
				photos: [
					{
						getUrl: function(dimensions){
							return "b.jpg"
						}
					}
				]
			})

			expect(details.name).toBe("");
			expect(details.vicinity).toBe("a");
			expect(details.photo).toBe("b.jpg");
		})

		it("should return a proper object", function(){
			var details = $scope.getDetailsOfPlace({
				name: "test",
				vicinity: "a",
				photos: [
					{
						getUrl: function(dimensions){
							return "b.jpg"
						}
					}
				]
			})

			expect(details.name).toBe("test");
			expect(details.vicinity).toBe("a");
			expect(details.photo).toBe("b.jpg");
		})
	})

	describe("Properly Process Results", function(){
		it("should properly process a like", function(){
			var oldUserProfile = Object.create($scope.userProfile);
			$scope.userProfile = {
				aggregateLikedTypes: ["a", "b", "c"],
				aggregatedDislikedTypes: ["d", "e", "f"],
				meanLikedRating: 3.5
			}

			var result = $scope.processResult({
				types:["a", "b", "d"],
				rating: 5
			})

			$scope.userProfile = oldUserProfile;

			expect(result).toBe("LIKE");
		})

		it("should properly process a dislike", function(){
			var oldUserProfile = Object.create($scope.userProfile);
			$scope.userProfile = {
				aggregateLikedTypes: ["a", "b", "c"],
				aggregatedDislikedTypes: ["d", "e", "f"],
				meanLikedRating: 3.5
			}

			var result = $scope.processResult({
				types:["d", "e", "f"],
				rating: 2
			})

			$scope.userProfile = oldUserProfile;

			expect(result).toBe("DISLIKE");
		})
	})
	
}])