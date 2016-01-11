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
        define(["require", "exports", "ninejs/core/i18n!./resources/i18n.json", 'ninejs/ui/Widget', './Skin/LoginScreen', 'ninejs/core/on', 'ninejs/core/deferredUtils', 'ninejs/request'], factory);
    }
})(function (require, exports) {
    'use strict';
    var Widget_1 = require('ninejs/ui/Widget');
    var LoginScreen_1 = require('./Skin/LoginScreen');
    var on_1 = require('ninejs/core/on');
    var deferredUtils_1 = require('ninejs/core/deferredUtils');
    var request_1 = require('ninejs/request');
    var i18n = require('ninejs/core/i18n!./resources/i18n.json');
    var resources = i18n.getResource();
    var LoginScreen = (function (_super) {
        __extends(LoginScreen, _super);
        function LoginScreen(_0, config) {
            _super.call(this, _0);
            var self = this;
            this.config = config;
            if (self.config.skin && self.config.skin.login) {
                self.set('skin', self.config.skin.login);
            }
        }
        LoginScreen.prototype.i18n = function (key) {
            return resources[key];
        };
        LoginScreen.prototype.userNameValidation = function (value) {
            return !!value;
        };
        LoginScreen.prototype.passwordValidation = function (value) {
            if (value && value.length > 3) {
                return '';
            }
            else {
                return this.i18n('passwordMustHaveFour');
            }
        };
        LoginScreen.prototype.onUpdatedSkin = function () {
            _super.prototype.onUpdatedSkin.call(this);
            var self = this;
            function performLogin() {
                return deferredUtils_1.when(request_1.default.post(self.config.loginUrl, {
                    preventCache: true,
                    handleAs: 'json',
                    withCredentials: true,
                    data: { user: self.userNameText.value, password: self.passwordText.value, parameters: {} }
                }), function (data) {
                    if (data.result === 'success') {
                        self.passwordText.value = '';
                        if (typeof (data.loggedInSince) === 'number') {
                            data.loggedInSince = new Date(data.loggedInSince);
                        }
                        setTimeout(function () {
                            self.emit('login', data);
                        }, 0);
                    }
                    else {
                        var skin = self.currentSkin;
                        skin.alert(data.message || 'login failed');
                    }
                    return true;
                }, function (err) {
                    console.log(err);
                });
            }
            this.own(on_1.default(this.loginButton, 'click', performLogin), on_1.default(this, 'performLogin', performLogin));
            setTimeout(function () {
                var skin = self.currentSkin;
                skin.validateUserName.call(self);
                skin.validatePassword.call(self);
                self.userNameText.focus();
            }, 0);
        };
        return LoginScreen;
    })(Widget_1.default);
    LoginScreen.prototype.skinContract = {
        'validateInput': {
            type: 'function'
        },
        'alert': {
            type: 'function'
        }
    };
    LoginScreen.prototype.skin = LoginScreen_1.default;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = LoginScreen;
});
//# sourceMappingURL=LoginScreen.js.map