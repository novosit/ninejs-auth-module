'use strict';
var extend = require('ninejs/core/extend'),
	Evented = require('ninejs/core/ext/Evented'),
	deferredUtils = require('ninejs/core/deferredUtils'),
	path = require('path'),
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
		utils.addModule('ninejs-auth-module/module', { 'ninejs-auth-module': { loginUrl: '/service/login' }});
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
			});
		}
		else {
			result = {
				result: 'failed'
			};
			res.end(JSON.stringify(result));
		}
		self.emit('login', result);
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
			res.end(JSON.stringify(data));
		});
	}}));
	//server.add(new SinglePageContainer({ route: '/login' }));
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
});
module.exports = Auth;