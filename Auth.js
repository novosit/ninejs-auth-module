'use strict';
var extend = require('ninejs/core/extend'),
	Evented = require('ninejs/core/ext/Evented'),
	deferredUtils = require('ninejs/core/deferredUtils'),
	objUtils = require('ninejs/core/objUtils'),
	path = require('path'),
	co = require('co'),
	Auth;
Auth = extend(Evented, {
	
}, function(config, module) {
	this.config = config;
	this.module = module;
	this.impl = module.getUnit('ninejs/auth/impl');
	var server = module.getUnit('webserver'),
		Endpoint = server.Endpoint,
		self = this;

	server.clientSetup(function(utils) {
		utils.addAmdPath('ninejs-auth-module', path.resolve(__dirname, 'client-side'));
		utils.addModule('ninejs-auth-module/module', { 'ninejs/auth': { loginUrl: '/service/login', logoutUrl: '/service/logout' }});
	});
	server.add(new Endpoint( { route: '/service/login',  method: 'get', handler: function(req, res) {
		var session = req.session,
			result;
		res.set('Content-Type', 'application/json');
		if (session.username) {
			deferredUtils.when(self.impl.getUser(session.username), function(data) {
				if (data) {
					result = {
						result: 'success',
						id: data.username
					};
					for (var p in data) {
						if ((p !== 'password') && data.hasOwnProperty(p)){
							result[p] = data[p];
						}
					}
				}
				else {
					result = {
						result: 'failed'
					};
				}
				res.end(JSON.stringify(result));
			}, function (err) {
				console.error(err);
			});
		}
		else {
			result = {
				result: 'failed'
			};
			res.end(JSON.stringify(result));
		}
	}}));
	server.add(new Endpoint( { route: '/service/login',  method: 'post', handler: function(req, res) {
		res.set('Content-Type', 'application/json');
		deferredUtils.when(self.login(req.body.user, req.body.password, req.body.domain, function(data) {
			var session = req.session;
			if (data.result === 'success') {
				session.username = req.body.user;
			}
			else {
				session.username = null;
			}
			return data;
		}), function(data) {
			self.emit('login', data);
			res.end(JSON.stringify(data));
		});
	}}));
	server.add(new Endpoint( { route: '/service/logout',  method: 'get', handler: function(req, res) {
		var session = req.session,
			result;
		res.set('Content-Type', 'application/json');
		if (session) {
			req.session.destroy();
			req.session = null;
		}
		result = {
			result: 'success'
		};
		self.emit('logout', result);
		res.end(JSON.stringify(result));
	}}));
	server.add(new Endpoint( { route: '/service/auth/users',  method: 'get', handler: function(req, res) {
		co(function* () {
			if (req.query.byPermissions) {
				var permissions = JSON.parse('\"' + req.query.byPermissions + '\"');
				if (!objUtils.isArray(permissions)) {
					permissions = [permissions];
				}
				var users = yield self.usersByPermission(permissions);
				res.end(JSON.stringify(users));
			}
			else {
				var users = yield self.usersByPermission();
				res.end(JSON.stringify(users));
			}
		});
	}}));
	server.add(new Endpoint( { route: '/service/auth/permissions',  method: 'get', handler: function(req, res) {
		co(function* () {
			var permissions = yield self.permissions();
			res.end(JSON.stringify(permissions));
		});
	}}));
	this.login = function(username, password, domain, callback) {
		if ((typeof(domain) === 'function') && !callback) {
			callback = domain;
			domain = null;
		}
		return deferredUtils.when(this.impl.login(username, password, domain), function(data) {
			if (callback) {
				callback(data);
			}
			return data;
		});
	};
	this.usersByPermission = function(permissions) {
		return this.impl.usersByPermission(permissions);
	};
	this.permissions = function() {
		return this.impl.permissions();
	};
});
module.exports = Auth;