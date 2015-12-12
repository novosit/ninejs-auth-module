var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, Promise, generator) {
    return new Promise(function (resolve, reject) {
        generator = generator.call(thisArg, _arguments);
        function cast(value) { return value instanceof Promise && value.constructor === Promise ? value : new Promise(function (resolve) { resolve(value); }); }
        function onfulfill(value) { try { step("next", value); } catch (e) { reject(e); } }
        function onreject(value) { try { step("throw", value); } catch (e) { reject(e); } }
        function step(verb, value) {
            var result = generator[verb](value);
            result.done ? resolve(result.value) : cast(result.value).then(onfulfill, onreject);
        }
        step("next", void 0);
    });
};
(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", 'ninejs/core/ext/Evented', 'ninejs/core/deferredUtils', 'ninejs/core/objUtils', 'path'], factory);
    }
})(function (require, exports) {
    'use strict';
    var Evented_1 = require('ninejs/core/ext/Evented');
    var deferredUtils_1 = require('ninejs/core/deferredUtils');
    var objUtils_1 = require('ninejs/core/objUtils');
    var path = require('path');
    class Auth {
        constructor(config, ninejs, webserver, impl) {
            this.config = config;
            this.impl = impl;
            var server = webserver, Endpoint = server.Endpoint, self = this;
            server.clientSetup(function (utils) {
                utils.addAmdPath('ninejs-auth-module/client', path.resolve(__dirname, 'client'));
                utils.addModule('ninejs-auth-module/client/module', {
                    'ninejs/auth': {
                        loginUrl: '/service/login',
                        logoutUrl: '/service/logout'
                    }
                });
            });
            server.add(new Endpoint({
                route: '/service/login', method: 'get', handler: function (req, res) {
                    var session = req.session, result;
                    res.set('Content-Type', 'application/json');
                    if (session.username) {
                        deferredUtils_1.when(self.impl.getUser(session.username), function (data) {
                            if (data) {
                                result = {
                                    result: 'success',
                                    id: data.username
                                };
                                for (var p in data) {
                                    if ((p !== 'password') && data.hasOwnProperty(p)) {
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
                }
            }));
            server.add(new Endpoint({
                route: '/service/login', method: 'post', handler: function (req, res) {
                    res.set('Content-Type', 'application/json');
                    deferredUtils_1.when(self.login(req.body.user, req.body.password, req.body.domain, function (data) {
                        var session = req.session;
                        if (data.result === 'success') {
                            session.username = req.body.user;
                        }
                        else {
                            session.username = null;
                        }
                        return data;
                    }), function (data) {
                        self.emit('login', data);
                        res.end(JSON.stringify(data));
                    });
                }
            }));
            server.add(new Endpoint({
                route: '/service/logout', method: 'get', handler: function (req, res) {
                    var session = req.session, result;
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
                }
            }));
            server.add(new Endpoint({
                route: '/service/auth/users', method: 'get', handler: function (req, res) {
                    return __awaiter(this, void 0, Promise, function* () {
                        if (req.query.byPermissions) {
                            var permissions = JSON.parse('\"' + req.query.byPermissions + '\"');
                            if (!objUtils_1.isArray(permissions)) {
                                permissions = [permissions];
                            }
                            var users = yield self.usersByPermission(permissions);
                            res.end(JSON.stringify(users));
                        }
                        else {
                            var users = yield self.users();
                            res.end(JSON.stringify(users));
                        }
                    });
                }
            }));
            server.add(new Endpoint({
                route: '/service/auth/permissions', method: 'get', handler: function (req, res) {
                    return __awaiter(this, void 0, Promise, function* () {
                        var permissions = yield self.permissions();
                        res.end(JSON.stringify(permissions));
                    });
                }
            }));
        }
        on() {
            return Evented_1.default.on.apply(this, arguments);
        }
        emit(type, data) {
            return Evented_1.default.emit.apply(this, arguments);
        }
        login(username, password, domain, callback) {
            let dom;
            if ((typeof (domain) === 'function') && !callback) {
                callback = domain;
                dom = null;
            }
            else {
                dom = domain;
            }
            return deferredUtils_1.when(this.impl.login(username, password, dom), function (data) {
                if (callback) {
                    callback(data);
                }
                return data;
            });
        }
        usersByPermission(permissions) {
            return this.impl.usersByPermission(permissions);
        }
        users() {
            return this.impl.users();
        }
        permissions() {
            return this.impl.permissions();
        }
    }
    exports.default = Auth;
});
//# sourceMappingURL=Auth.js.map