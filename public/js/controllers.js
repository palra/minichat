angular.module('boredomApp.controllers', []).
	controller("boredomMessagesCtrl", function boredomMessagesCtrl($scope, socket, $anchorScroll, $location, $timeout) {

		$scope.messages = [];
		$scope.message = "";

		// Socket listeners
		// ================

		socket.on('init', function (data) {
			$scope.name = data.name;
			$scope.users = data.users;

		});

		socket.on('send:message', function (message) {
			displayMessage(message);
		});

		socket.on('change:name', function (data) {
			changeName(data.oldName, data.newName);
		});

		socket.on('user:join', function (data) {
			displayMessage({
				user: 'Info',
				text: 'Dites bonjour à ' + data.name + ' !'
			});
			$scope.users.push(data.name);
		});

		// add a message to the conversation when a user disconnects or leaves the room
		socket.on('user:left', function (data) {
			displayMessage({
				user: 'Info',
				text: data.name + ' est parti de la salle.'
			});
			var i, user;
			for (i = 0; i < $scope.users.length; i++) {
				user = $scope.users[i];
				if (user === data.name) {
					$scope.users.splice(i, 1);
					break;
				}
			}
		});

		// Private helpers
		// ===============

		var displayMessage = function(obj) {
			// The array of regex patterns to look for
			var format_search =  [
			    /\[b\](.*?)\[\/b\]/ig,
			    /\[i\](.*?)\[\/i\]/ig,
			    /\[u\](.*?)\[\/u\]/ig,
			    /\[img\](.*?)\[\/img\]/ig
			]; // note: NO comma after the last entry
			
			// The matching array of strings to replace matches with
			var format_replace = [
			    '<strong>$1</strong>',
			    '<em>$1</em>',
			    '<span style="text-decoration: underline;">$1</span>',
			    '<img src="$1"></img>'
			];
			
			// Perform the actual conversion
			for (var i =0;i<format_search.length;i++) {
			  obj.text = obj.text.replace(format_search[i], format_replace[i]);
			}
			
			if(obj.text.slice(0, 3) == "/me") {
				obj.text = obj.user + obj.text.slice(3);
				obj.user = "Info";
			}
			
			if($scope.messages.length > 99)
				$scope.messages = $scope.messages.slice(1);
			$scope.messages.push(obj);
			$timeout(function(){
				$("#messages").prop({scrollTop: $("#messages").prop("scrollHeight")+100000});
			});
		};

		var changeName = function (oldName, newName) {
			// rename user in list of users
			var i;
			for (i = 0; i < $scope.users.length; i++) {
				if ($scope.users[i] === oldName) {
					$scope.users[i] = newName;
				}
			}

			displayMessage({
				user: 'Info',
				text:  oldName + ' a changé de nom pour ' + newName + '.'
			});
		}

		// Methods published to the scope
		// ==============================

		$scope.changeName = function () {
			socket.emit('change:name', {
				name: $scope.newName
			}, function (result) {
				if (!result) {
					displayMessage({
						user: "Erreur",
						text: "Il y a eu une erreur lors du chngement de ton pseudo !"
					});
					$scope.newName = '';
				} else {

					changeName($scope.name, $scope.newName);

					$scope.name = $scope.newName;
					$scope.newName = '';
				}
			});
		};

		$scope.sendMessage = function () {
			if($scope.message != "" || typeof $scope.message == undefined )
			{
				socket.emit('send:message', {
					message: $scope.message
				});

				// add the message to our model locally
				displayMessage({
					user: $scope.name,
					text: $scope.message
				});

				// clear message box
				$scope.message = '';
			}
		};

		$scope.init = function() {
			function resizeContainers() {
				if($(window).width() >= 768) {
					$("#users").height($(window).height() * 0.7);
					$("#messages").height($(window).height() * 0.7);
				}
				else {
					$("#users").height("100%");
					$("#messages").height($(window).height() * 0.5);
				}
			};
			window.onresize = resizeContainers;
			resizeContainers();
		}
	});