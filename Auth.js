'use strict';
var extend = require('ninejs/core/extend');
var passport = require('passport');
var path = require('path');
var Auth = extend({
	
}, function(config, module) {
	this.config = config;
	this.module = module;
	var server = module.getUnit('webserver');
	var SinglePageContainer = server.SinglePageContainer;

	server.clientSetup(function(utils) {
		utils.addAmdPath('ninejs-auth-module', path.resolve(__dirname, 'client-side'));
		utils.addModule('ninejs-auth-module/module', {});
	});
	//server.add(new SinglePageContainer({ route: '/login' }));
});
module.exports = Auth;