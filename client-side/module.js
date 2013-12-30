define(['ninejs/modules/Module', 'ninejs/core/extend', './Auth'], function(Module, extend, Auth) {
	'use strict';
	var AuthModule = Module.extend({
		getProvides: function(name) {
			if (name === 'ninejs-auth-module') {
				return this.auth;
			}
		},
		init: extend.after(function(name, config) {
			if (name === 'ninejs-auth-module') {
				var router = this.getUnit('router'),
					frame = this.getUnit('singlePageContainer'),
					auth = new Auth(config, router, frame);
				this.auth = auth;
			}
		}),
		consumes: [
			{
				id: 'router'
			},
			{
				id: 'singlePageContainer'
			}
		],
		provides: [
			{
				id: 'ninejs-auth-module'
			}
		]
	});
	var result = new AuthModule();
	return result;
});