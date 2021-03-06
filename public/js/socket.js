/*
 * angular-socket-io v0.0.2
 * (c) 2013 Brian Ford http://briantford.com
 * License: MIT
 */

'use strict';

angular.module('btford.socket-io', []).
	factory('socket', function ($rootScope, $timeout) {
		var connected = false;
		var socket = io.connect("/", {transports: ["websocket", "xhr-polling"]});
		socket.on('connect', function(){
			connected = true;
		})
		socket.on('disconnect', function(){
			connected = true;
		})
		var room = "";

		return {
			join: function(room, callback) {
				
			},
			on: function (eventName, callback) {
				socket.on(eventName, function () {  
					var args = arguments;
					$timeout(function () {
						callback.apply(socket, args);
					}, 0);
				});
			},
			emit: function (eventName, data, callback) {
				socket.emit(eventName, data, function () {
					var args = arguments;
					$rootScope.$apply(function () {
						if (callback) {
							callback.apply(socket, args);
						}
					});
				});
			}
		};
	});