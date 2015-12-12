'use strict';

import Properties from 'ninejs/core/ext/Properties'
import { RemovableType } from 'ninejs/core/on'
import { when, defer, PromiseType } from 'ninejs/core/deferredUtils'
import Evented from 'ninejs/core/ext/Evented'
import { get } from 'ninejs/request'
import Frame from 'ninejs/modules/client/FullScreenFrame'
import { Router, Route } from 'ninejs/client/router'
import extend from 'ninejs/core/extend'
import LoginScreen from "./LoginScreen";


export interface RouteArguments {
	route?: string;
	action?: (e: any) => any;
	[ name: string ]: any;
}

export interface PermissionsFunction {
	(permissions: string[]): boolean
}

class Auth extends Properties {
	on(type:string, listener:(e?:any) => any) {
		return Evented.on(type, listener);
	}

	emit(type:string, data:any) {
		return Evented.emit(type, data);
	}
	loginScreen: LoginScreen;
	config: any;
	data: Properties;
	frame: Frame;
	router: Router;

	logout () {
		return when(get(this.config.logoutUrl, {
			preventCache: false,
			handleAs: 'json',
			withCredentials: true
		}), (data) => {
			this.set('userName', null);
			this.set('permissions', []);
			this.emit('logout', data);
			return true;
		});
	}

	register (route: string, action: (e: any) => any, permissions: string[], routeArguments: RouteArguments) {
		let self = this;
		routeArguments = routeArguments || {};
		action = action || routeArguments.action;
		routeArguments.route = route;
		routeArguments.action = function (evt) {
			function authenticate() {
				return when(self.authenticationStatus(permissions || []), function (result) {
					if (result) {
						return when(action.call(null, evt), function () {
							return true;
						});
					}
					else {
						return when(self.login(), function () {
							var d = defer();
							setTimeout(function () {
								when(authenticate(), function (r) {
											d.resolve(r);
										},
										function (err) {
											d.reject(err);
										}
								);
							}, 0);
							return d.promise;
						}, function (err) {
							console.error(err);
							throw err;
						});
					}
				}, function (err) {
					console.error(err);
					throw err;
				});
			}

			return when(authenticate(), function (r) {
				return r;
			}, function (err) {
				console.error(err);
				throw err;
			});
		};
		var handle = this.router.register(routeArguments);
		return handle;
	}

	login () {
		var currentSelection = this.frame.get('selected'),
				d = defer();
		return when(this.loginScreen.show(), () => {
			when(this.enableLoginScreen(), () => {
				let onLoginHandle: RemovableType = this.loginScreen.on('login', () => {
					onLoginHandle.remove();
					if (currentSelection) {
						this.frame.set('selected', currentSelection);
					}
					d.resolve(true);
				});
			});
			return d.promise;
		});
	}
	enableLoginScreen () {
		return when(this.logout(), () => {
			this.frame.set('selected', this.loginScreen);
		});
	}

	authenticationStatus (requiredPermissions: (string[] | PermissionsFunction)) {
		var self = this;
		return when(get(this.config.loginUrl, {
			preventCache: false,
			handleAs: 'json',
			withCredentials: true
		}), function (data) {
			var r = false;
			if (data.result === 'success') {
				self.data.mixinRecursive(data);
				//data.permissions = data.permissions || [];
				//self.set('userName', data.id);
				//self.set('permissions', data.permissions);
				if (typeof(requiredPermissions) === 'function') {
					let permissionFunction = requiredPermissions as PermissionsFunction;
					r = (permissionFunction(self.data['permissions']));
				}
				else {
					let permissions: string[] = requiredPermissions as string[];
					if (permissions.length) {
						var cnt: number,
							len = permissions.length,
							current: string,
							dcnt: number,
							dlen = self.data['permissions'].length,
							found: boolean;
						r = true;
						for (cnt = 0; cnt < len; cnt += 1) {
							current = permissions[cnt];
							found = false;
							for (dcnt = 0; (dcnt < dlen) && !found; dcnt += 1) {
								if (current === self.data['permissions'][dcnt]) {
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
	}

	/**
	 * Checks if the actual user permissions contains all the permissions to check. Use this method to validate if a user has a set of permissions prior to perform some controlled action.
	 * @param  {Array of String}  permissions Permissions to check.
	 * @return {Boolean}  `true` if the logged in user has all the permissions given as parameter
	 */
	hasAllPermissions (permissions: string[]) {

		if (this.data && this.data['permissions'] && this.data['permissions'].length) {
			var arr = this.data['permissions'];
			for (var i = permissions.length - 1; i >= 0; i -= 1) {
				if (arr.indexOf(permissions[i]) === -1) {
					return false;
				}
			}

			return true;
		}

		return false;
	}

	hasPermission (permission: string) {
		return this.hasAllPermissions([permission]);
	}

	constructor(config:any, router:Router, frame:Frame) {
		super({});
		var loginScreen: LoginScreen,
				self = this;
		this.config = config;
		this.data = new Properties();
		this.loginScreen = new LoginScreen({}, config);
		this.frame = frame;
		this.router = router;

		router.register('/login', (e: any) => {
			this.enableLoginScreen();
		}, extend.mixinRecursive({
			emitArguments: {
				tabKey: 'login'
			}
		}, config.loginRouterArguments || {}));
		router.register('/logout', (e: any) => {
			return when(self.logout(), function () {
				router.go('/', false);
			});
		}, extend.mixinRecursive({
			emitArguments: {
				tabKey: 'logout'
			}
		}, config.logoutRouterArguments || {}));
	}
	init () {
		return when(this.loginScreen.show(), (domNode) => {
			this.frame.addChild(domNode);
		});
	}
}

export default Auth;