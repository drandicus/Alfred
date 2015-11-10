alfredApp.controller('mainController', ['$scope', '$http', '$location', '$cookies', function($scope, $http, $location, $cookies) {
	
	$scope.cookieEmail = $cookies.get('email');
	$scope.cookieLastLogin = $cookies.get('lastSignIn');

	/* This function initializes the cookies to allow easier log in */
	$scope.initializeCookies = function(email){
		$cookies.put('email', email);
		$cookies.put('lastSignIn', Date.now());
		$location.path("/home");
	}

	/* Checks to see if the last login was within a week and if it is, redirect automatically to the home page */
	if((typeof $scope.cookieEmail !== "undefined") && (typeof $scope.cookieLastLogin !== "undefined")){
		var daysSinceLastLogin = Math.floor((Date.now() - $scope.cookieLastLogin) / (1000 * 60 * 60 * 24));
		if(daysSinceLastLogin < 7){
			$scope.initializeCookies($scope.cookieEmail);
		}

	}

	$('#signup').click(function(){
		$('#signupModal').modal()
	})

	$('#login').click(function(){
		$('#loginModal').modal()
	})

	/* Matches the password against a regex to check validity */
	$scope.passwordTest = function(regEx, password, errorMessage){
		var test = regEx.test(password);
		if(!test) $scope.errors.push(errorMessage)
	}

	$scope.displayErrors = function(){
		$('.error-text').css('display', 'inline-block');
		$scope.errorText = $scope.errors.join("\n");
	}


	/* Helper Function to see if there are errors in the signing up process */
	$scope.checkErrors = function(){
		$scope.errors = [];

		$scope.passwordTest(/^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i, $scope.signUpEmail, 'Email is not a Valid Email');

		if($scope.signUpEmail != $scope.validateEmail) $scope.errors.push("Emails do not match");
		
		var password = $scope.signupPassword
		$scope.passwordTest(/\d+/g, password, "Password does not contain any numbers");
		$scope.passwordTest(/[a-z]/, password, "Password does not contains any lowercase letters");
		$scope.passwordTest(/[A-Z]/, password, "Password does not contains any uppercase letters");
		
		return $scope.errors;
	}

	/* This function handles the signing in for the application */
	$scope.signup = function(){
		var errors = $scope.checkErrors();

		if(errors.length != 0) {
			$scope.displayErrors(errors);
			return;
		}

		var data = {
			firstName: $scope.firstName,
			lastName: $scope.lastName,
			email: $scope.signUpEmail,
			password: $scope.signupPassword
		}

		/* Handles the posting and the error displaying and cookie set up */
		$http.post('/api/signup', data).then(
			function(data, status){
				if(data.data == "Success"){
					$('#signupModal').modal('hide');
					$scope.initializeCookies($scope.signUpEmail);
				} else{
					alert(data.data);
				}
			}, function(){
				alert("Signing Up Process Interrupted, Please Try Again");
			}
		)
	}

	
	/* This function handles the logging into the application */
	$scope.login = function(){
		var data = {
			email: $scope.loginEmail,
			password: $scope.loginPassword
		};

		$http.post('/api/login', data).then(
			function(data, status){
				if(data.data == "Success"){
					$('#loginModal').modal('hide');
					$scope.initializeCookies($scope.loginEmail);
				} else {
					alert(data.data);
				}
			}, function(){
				alert("Logging in Process Interrupted, Please Try Again");
			}
		)
	}

	$scope.sliderCount = 0;

	angular.element(document).ready(function(){
		
		/* This function slides through the stuff in the home page*/
		setTimeout(function(){
			var children = $('#home-slider').children();
			var maxCount = children.length;

			$scope.sliderCount = $scope.sliderCount == maxCount-1 ? 0 : $scope.sliderCount + 1;
			var translate = $scope.sliderCount * 100;

			children.css('transform', 'translate(-' + translate + '%, 0%)');

			var prev = $('.slider-button.button-active');

			if($scope.sliderCount == 0){
				$($('.slider-button-container').children()[0]).addClass('button-active');
			} else {
				prev.next().addClass('button-active');
			}

			prev.removeClass('button-active');

			setTimeout(arguments.callee, 5000);
		}, 5000);
	})


}]);