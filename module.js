'use strict';
var extend = require('ninejs/core/extend');
var Module = require('ninejs/modules/Module');
var AuthModule = extend(Module, {
	consumes: [
		{
			id: 'ninejs',
			version: '*',
			features: {}
		},
		{
			id: 'webserver',
			version: '*'
		},
		{
			id: 'ninejs/auth/impl'
		}
	],
	provides: [
		{
			id: 'ninejs/auth',
			version: require('./package.json').version
		}
	],
	getProvides: function(name) {
		if (name === 'ninejs/auth') {
			return this.auth;
		}
		return null;
	},
	init: extend.after(function(name, config) {
		var log,
			Auth;
		if (name === 'ninejs/auth') {
			log = this.getUnit('ninejs').get('logger');
			log.info('ninejs/auth module starting');
			Auth = require('./Auth');
			this.auth = new Auth(config, this);
		}
	})
});
module.exports = new AuthModule();