'use strict';

var jukeApp = angular.module('jukeApp', [
    'ngRoute',
    'jukeServices',
    'jukeFilters',
    'ui.bootstrap'
]).
config(['$routeProvider', 
	function($routeProvider) {
	    $routeProvider.
		when('/', {
		    templateUrl: 'partials/loginView.html',
		    controller: LoginCtrl}).
		when('/about', {
		    templateUrl: 'partials/aboutView.html',
		    controller: LoginCtrl}).
		when('/home', {
		    templateUrl: 'partials/homeView.html',
		    controller: HomeCtrl}).
		when('/hubs', {
		    templateUrl: 'partials/hubsListView.html',
		    controller: HubCtrl}).
		when('/hubs/:hubId', {
		    templateUrl: 'partials/hubView.html',
		    controller: HubCtrl}).
		when('/player/:hubId', {
		    templateUrl: 'partials/playerView.html',
		    controller: PlayerCtrl}).
		otherwise({redirectTo: '/'});
	}]);
 


