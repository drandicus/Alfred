alfredApp.run(function($rootScope){

	/* This function is called to redirect based on the sidebar */
	$rootScope.sidebarRedirect = function($location, loc){
		$location.path("/" + loc);
	}


	/* This function signs the user out */
	$rootScope.signOut = function($cookies, $location){
		$cookies.remove('email');
		$cookies.remove('lastSignIn');
		$location.path("/");
	}


	/* This function toogles the animation flip the main board */
	$rootScope.flip = function($scope){
		if($scope.canFlip){
			$('#card').flip('toggle');
		}
	}

	/* This function allows the sidebar to be displayed or not */
	$rootScope.toggleSidebar = function($scope){

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

	/* This function removes the sidebar */
	$rootScope.removeSidebar = function($scope){
		if($scope.toggledSidebar) return;
		$scope.toggleSidebar();
	}
});