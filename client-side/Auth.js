define(['ninejs/core/extend', 'ninejs/core/deferredUtils', 'ninejs/core/ext/Evented', 'ninejs/request', './LoginScreen'], function(extend, deferredUtils, Evented, request, LoginScreen) {
	'use strict';
	var Auth = extend(Evented, function Auth(config, router, frame) {
		var loginScreen,
			enableLoginScreen,
			self = this;
		this.loginScreen = new LoginScreen(config);
		loginScreen = this.loginScreen;
		enableLoginScreen = function () {
			frame.set('selected', loginScreen);
		};
		this.register = function (route, action, permissions) {
			var handle = router.register(route, function(evt) {
				function authenticate() {
					deferredUtils.when(self.authenticationStatus(permissions || []), function(result) {
						if (result) {
							action.call(null, evt);
						}
						else {
							deferredUtils.when(self.login(), function(){
								setTimeout(function() {
									authenticate();
								}, 0);
							});
						}
					});
				}
				authenticate();
			});
			return handle;
		};
		this.login = function() {
			var currentSelection = frame.get('selected'),
				defer = deferredUtils.defer(),
				onLoginHandle;
			enableLoginScreen();
			onLoginHandle = this.loginScreen.on('login', function() {
				onLoginHandle.remove();
				if (currentSelection) {
					frame.set('selected', currentSelection);
				}
				defer.resolve(true);
			});
			return defer.promise;
		};
		this.authenticationStatus = function() {
			var self = this;
			return deferredUtils.when(request.get(config.loginUrl, { preventCache: false, handleAs: 'json' }), function(data) {
				var r = false;
				if (data.result === 'success') {
					self.userName = data.id;
					self.permissions = data.permissions || [];
					r = true;
				}
				else {
					self.userName = null;
					self.permissions = [];
				}
				self.emit('login', data);
				return r;
			});
		};
		router.register('/login', function() {
			enableLoginScreen();
		});
		loginScreen.show();
		frame.addChild(loginScreen.domNode);
	});
	return Auth;
});