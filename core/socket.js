var User = require("./user.js");

var users = [];

module.exports = function (socket) {
	var user = new User(socket);
	users.push(user);
};