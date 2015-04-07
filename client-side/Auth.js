define(['ninejs/core/extend', 'ninejs/core/ext/Properties', 'ninejs/core/deferredUtils', 'ninejs/core/ext/Evented', 'ninejs/request', './LoginScreen'], function(extend, Properties, deferredUtils, Evented, request, LoginScreen) {
	'use strict';
	var Auth = extend(Properties, Evented, function Auth(config, router, frame) {
		var loginScreen,
			enableLoginScreen,
			self = this;
		this.config = config;
		this.data = new Properties();
		this.loginScreen = new LoginScreen({}, config);
		loginScreen = this.loginScreen;
		enableLoginScreen = function () {
			return deferredUtils.when(self.logout(), function() {
				frame.set('selected', loginScreen);
			});
		};
		this.register = function (route, action, permissions, routeArguments) {
			routeArguments = routeArguments || {};
			routeArguments.route = route;
			routeArguments.action = function (evt) {
				function authenticate() {
					return deferredUtils.when(self.authenticationStatus(permissions || []), function (result) {
						if (result) {
							return deferredUtils.when(action.call(null, evt), function () {
								return true;
							});
						}
						else {
							return deferredUtils.when(self.login(), function () {
								var defer = deferredUtils.defer();
								setTimeout(function () {
									deferredUtils.when(authenticate(), function (r) {
										defer.resolve(r);
									},
									function (err) {
										defer.fail(err);
									});
								}, 0);
								return defer.promise;
							});
						}
					});
				}
				return deferredUtils.when(authenticate(), function (r) {
					return r;
				});
			};
			var handle = router.register(routeArguments);
			return handle;
		};
		this.logout = function () {
			var self = this;
			return deferredUtils.when(request.get(config.logoutUrl, { preventCache: false, handleAs: 'json', withCredentials: true }), function (data) {
				self.set('userName', null);
				self.set('permissions', []);
				self.emit('logout', data);
				return true;
			});
		};
		this.login = function () {
			var currentSelection = frame.get('selected'),
				defer = deferredUtils.defer(),
				onLoginHandle;
			return deferredUtils.when(this.loginScreen.show(), function () {
				deferredUtils.when(enableLoginScreen(), function () {
					onLoginHandle = loginScreen.on('login', function () {
						onLoginHandle.remove();
						if (currentSelection) {
							frame.set('selected', currentSelection);
						}
						defer.resolve(true);
					});
				});
				return defer.promise;
			});
		};
		this.authenticationStatus = function (requiredPermissions) {
			var self = this;
			return deferredUtils.when(request.get(config.loginUrl, { preventCache: false, handleAs: 'json', withCredentials: true }), function(data) {
				var r = false;
				if (data.result === 'success') {
					self.data.mixinRecursive(data);
					//data.permissions = data.permissions || [];
					//self.set('userName', data.id);
					//self.set('permissions', data.permissions);
					if (typeof(requiredPermissions) === 'function') {
						r = (requiredPermissions(self.data.permissions));
					}
					else {
						if (requiredPermissions.length) {
							var cnt,
								len = requiredPermissions.length,
								current,
								dcnt,
								dlen = self.data.permissions.length,
								found;
							r = true;
							for (cnt = 0; cnt < len; cnt += 1) {
								current = requiredPermissions[cnt];
								found = false;
								for (dcnt = 0; (dcnt < dlen) && !found; dcnt += 1) {
									if (current === self.data.permissions[dcnt]) {
										found = true;
									}
								}
								r = r && !!found;
							}
						}
						else {
							r = true;
						}
					}
				}
				else {
					self.data.set('id', null);
					self.data.set('permissions', []);
				}
				setTimeout(function () {
					self.emit('login', data);
				}, 0);
				return r;
			}, function (err) {
				console.error(err);
				throw err;
			});
		};
		/**
		 * Checks if the actual user permissions contains all the permissions to check. Use this method to validate if a user has a set of permissions prior to perform some controlled action.
		 * @param  {Array of String}  permissions Permissions to check.
		 * @return {Boolean}  `true` if the logged in user has all the permissions given as parameter
		 */
		this.hasAllPermissions = function (permissions) {

			if (this.data && this.data.permissions && this.data.permissions.length) {
				var arr = this.data.permissions;
				for (var i = permissions.length - 1; i >= 0; i -= 1) {
					if (arr.indexOf(permissions[i]) === -1) {
						return false;
					}
				}

				return true;
			}

			return false;
		};
		this.hasPermission = function (permission) {
			return this.hasAllPermissions([permission]);
		};
		router.register('/login', function() {
			enableLoginScreen();
		}, extend.mixinRecursive({
			emitArguments: {
				tabKey: 'login'
			}
		}, config.loginRouterArguments || {}));
		router.register('/logout', function() {
			deferredUtils.when(self.logout(), function() {
				router.go('/');
			});
		}, extend.mixinRecursive({
			emitArguments: {
				tabKey: 'logout'
			}
		}, config.logoutRouterArguments || {}));
		deferredUtils.when(loginScreen.show(), function() {
			frame.addChild(loginScreen.domNode);
		});
	});
	return Auth;
});