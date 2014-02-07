/**
*  boredomApp
*
* Main application
*/
angular.module('boredomApp', [
	'btford.socket-io',
	'boredomApp.controllers'
]).
config(function ($routeProvider, $locationProvider) {
	$routeProvider.
		when('/messages', {
			controller: 'boredomMessagesCtrl'
		}).
		otherwise({
			redirectTo: '/messages'
		});

	$locationProvider.html5Mode(true);
  
});