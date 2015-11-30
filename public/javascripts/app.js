var alfredApp = angular.module('alfredApp', ['ngRoute', 'ngSanitize', 'ngCookies']);

/* This sets up the routes provided to Angular */
alfredApp.config(function($routeProvider) {

    $routeProvider
        .when('/', {
            templateUrl : 'views/home.html',
            controller  : 'mainController'
        })

        .when('/home', {
            templateUrl : 'views/main.html',
            controller  : 'homeController'
        })

        .when('/restaurant', {
            templateUrl : 'views/restaurant.html',
            controller : 'restaurantController'
        })

        .when('/profile', {
            templateUrl: 'views/profile.html',
            controller: 'profileController'
        })

        .otherwise({redirectTo: '/'});
});


