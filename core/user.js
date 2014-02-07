var userNames = require("./names.js");

var User = function User(sockt) {
	// Init vars

	var name = userNames.getGuestName();

	if(typeof sockt == undefined)
		throw "No socket passed to the User instance.";

	var socket = sockt;

	// Methods

	this.getName = function () { return name; };

	this.setName = function (nme) {
		if(userNames.claim(nme) && userNames.free(name))
			name = nme;
		else
			return false;
		return true;
	};

	this.getSocket = function () { return socket; };

	// Sockets

	var that = this;

	socket.broadcast.emit('user:join', {
		name: that.getName()
	});

	socket.emit('init', {
		name: that.getName(),
		users: userNames.get()
	});


	socket.on('send:message', function (data) {
		socket.broadcast.emit('send:message', {
			user: that.getName(),
			text: data.message
		});
	});

	socket.on('change:name', function (data, fn) {
		var oldName = that.getName();
		if(that.setName(data.name)) {
			socket.broadcast.emit('change:name', {
				oldName: oldName,
				newName: that.getName()
			});

			fn(true);
		} else {
			fn(false);
		}
	});

	socket.on('disconnect', function () {
		if(that.disconnect())
			socket.broadcast.emit('user:left', {
				name: that.getName(),
			});
	});
};

User.prototype.disconnect = function() { return userNames.free(this.getName()); }

module.exports = User;