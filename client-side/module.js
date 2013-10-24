define(['ninejs/modules/Module', 'ninejs/core/extend', 'ninejs/request', './LoginScreen'], function(Module, extend, request, LoginScreen) {
	'use strict';
	var AuthModule = Module.extend({
		init: extend.after(function(/*name, config*/) {
			var router = this.getUnit('router'),
				frame = this.getUnit('frame'),
				loginScreen = new LoginScreen();
			router.register('/login', function() {
				frame.set('selected', loginScreen);
			});
			loginScreen.show();
			frame.addChild(loginScreen.domNode);
		}),
		consumes: [
			{
				id: 'router'
			},
			{
				id: 'frame'
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