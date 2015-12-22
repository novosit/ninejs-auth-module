var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", 'ninejs/core/ext/Properties', 'ninejs/core/deferredUtils', 'ninejs/core/ext/Evented', 'ninejs/request', 'ninejs/core/extend', "./LoginScreen"], factory);
    }
})(function (require, exports) {
    'use strict';
    var Properties_1 = require('ninejs/core/ext/Properties');
    var deferredUtils_1 = require('ninejs/core/deferredUtils');
    var Evented_1 = require('ninejs/core/ext/Evented');
    var request_1 = require('ninejs/request');
    var extend_1 = require('ninejs/core/extend');
    var LoginScreen_1 = require("./LoginScreen");
    var Auth = (function (_super) {
        __extends(Auth, _super);
        function Auth(config, router, frame) {
            var _this = this;
            _super.call(this, {});
            var loginScreen, self = this;
            this.config = config;
            this.data = new Properties_1.default({});
            this.loginScreen = new LoginScreen_1.default({}, config);
            this.frame = frame;
            this.router = router;
            router.register('/login', function (e) {
                _this.enableLoginScreen();
            }, extend_1.default.mixinRecursive({
                emitArguments: {
                    tabKey: 'login'
                }
            }, config.loginRouterArguments || {}));
            router.register('/logout', function (e) {
                return deferredUtils_1.when(self.logout(), function () {
                    router.go('/', false);
                });
            }, extend_1.default.mixinRecursive({
                emitArguments: {
                    tabKey: 'logout'
                }
            }, config.logoutRouterArguments || {}));
        }
        Auth.prototype.on = function (type, listener) {
            return Evented_1.default.on(type, listener);
        };
        Auth.prototype.emit = function (type, data) {
            return Evented_1.default.emit(type, data);
        };
        Auth.prototype.logout = function () {
            var _this = this;
            return deferredUtils_1.when(request_1.get(this.config.logoutUrl, {
                preventCache: false,
                handleAs: 'json',
                withCredentials: true
            }), function (data) {
                _this.set('userName', null);
                _this.set('permissions', []);
                _this.emit('logout', data);
                return true;
            });
        };
        Auth.prototype.register = function (route, action, permissions, routeArguments) {
            var self = this;
            routeArguments = routeArguments || {};
            action = action || routeArguments.action;
            routeArguments.route = route;
            routeArguments.action = function (evt) {
                function authenticate() {
                    return deferredUtils_1.when(self.authenticationStatus(permissions || []), function (result) {
                        if (result) {
                            return deferredUtils_1.when(action.call(null, evt), function () {
                                return true;
                            });
                        }
                        else {
                            return deferredUtils_1.when(self.login(), function () {
                                var d = deferredUtils_1.defer();
                                setTimeout(function () {
                                    deferredUtils_1.when(authenticate(), function (r) {
                                        d.resolve(r);
                                    }, function (err) {
                                        d.reject(err);
                                    });
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
                return deferredUtils_1.when(authenticate(), function (r) {
                    return r;
                }, function (err) {
                    console.error(err);
                    throw err;
                });
            };
            var handle = this.router.register(routeArguments);
            return handle;
        };
        Auth.prototype.login = function () {
            var _this = this;
            var currentSelection = this.frame.get('selected'), d = deferredUtils_1.defer();
            return deferredUtils_1.when(this.loginScreen.show(), function () {
                deferredUtils_1.when(_this.enableLoginScreen(), function () {
                    var onLoginHandle = _this.loginScreen.on('login', function () {
                        onLoginHandle.remove();
                        if (currentSelection) {
                            _this.frame.set('selected', currentSelection);
                        }
                        d.resolve(true);
                    });
                });
                return d.promise;
            });
        };
        Auth.prototype.enableLoginScreen = function () {
            var _this = this;
            return deferredUtils_1.when(this.logout(), function () {
                _this.frame.set('selected', _this.loginScreen);
            });
        };
        Auth.prototype.authenticationStatus = function (requiredPermissions) {
            var self = this;
            return deferredUtils_1.when(request_1.get(this.config.loginUrl, {
                preventCache: false,
                handleAs: 'json',
                withCredentials: true
            }), function (data) {
                var r = false;
                if (data.result === 'success') {
                    self.data.mixinRecursive(data);
                    if (typeof (requiredPermissions) === 'function') {
                        var permissionFunction = requiredPermissions;
                        r = (permissionFunction(self.data['permissions']));
                    }
                    else {
                        var permissions = requiredPermissions;
                        if (permissions.length) {
                            var cnt, len = permissions.length, current, dcnt, dlen = self.data['permissions'].length, found;
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
        };
        Auth.prototype.hasAllPermissions = function (permissions) {
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
        };
        Auth.prototype.hasPermission = function (permission) {
            return this.hasAllPermissions([permission]);
        };
        Auth.prototype.init = function () {
            var _this = this;
            return deferredUtils_1.when(this.loginScreen.show(), function (domNode) {
                _this.frame.addChild(domNode);
            });
        };
        return Auth;
    })(Properties_1.default);
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = Auth;
});
//# sourceMappingURL=Auth.js.map