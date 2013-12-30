define(['ninejs/core/extend', 'ninejs/ui/Widget', './Skin/LoginScreen', 'ninejs/core/i18n!./resources/i18n.json', 'dojo/on', 'ninejs/ui/utils/setClass', 'ninejs/core/deferredUtils', 'ninejs/request'], function(extend, Widget, defaultSkin, i18n, on, setClass, deferredUtils, request) {
	'use strict';
	var resources = i18n.getResource(),
		LoginScreen;
	LoginScreen = Widget.extend({
		skin: defaultSkin,
		i18n: function() {
			return resources[arguments[0]];
		},
		userNameValidation: function(value) {
			return !!value;
		},
		passwordValidation: function(value) {
			if (value && value.length > 3) {
				return '';
			}
			else {
				return this.i18n('passwordMustHaveFour');
			}
		},
		updateSkin: extend.after(function() {
			var self = this;
			function validateInput(isValid) {
				var valid = isValid && self.userNameText.value && self.passwordText.value;
				setClass(self.loginIcon, '!valid', '!invalid', '!glyphicon-exclamation-sign', '!glyphicon-check');
				if (valid) {
					setClass(self.loginIcon, 'glyphicon-check', 'valid');
				}
				else {
					setClass(self.loginIcon, 'glyphicon-exclamation-sign', 'invalid');
				}
			}
			function validateUserName() {
				validateInput();
			}
			function validateUserNameBlur() {
				var deferred = deferredUtils.defer(),
					value = self.userNameText.value;
				if (self.userNameValidation) {
					deferredUtils.when(self.userNameValidation(value), function(result) {
						deferred.resolve(result);
					});
				}
				else {
					deferred.resolve(true);
				}
				return deferred;
			}
			function validatePassword() {
				var message = '';
				if (self.passwordValidation) {
					message = self.passwordValidation(self.passwordText.value);
				}
				setClass(self.passwordIcon, '!valid', '!invalid', '!glyphicon-exclamation-sign', '!glyphicon-check');
				if (!message) {
					setClass(self.passwordIcon, 'glyphicon-check', 'valid');
				}
				else {
					setClass(self.passwordIcon, 'glyphicon-exclamation-sign', 'invalid');
				}
				validateInput(!message);
			}
			this.own(
				on(this.userNameText, 'keyup', function() {
					validateUserName.call(self);
				}),
				on(this.userNameText, 'blur', function() {
					deferredUtils.when(validateUserNameBlur.call(self), function(valid) {
						setClass(self.userNameIcon, '!valid', '!invalid', '!glyphicon-exclamation-sign', '!glyphicon-check');
						if (valid) {
							setClass(self.userNameIcon, 'glyphicon-check', 'valid');
						}
						else {
							setClass(self.userNameIcon, 'glyphicon-exclamation-sign', 'invalid');
						}
					});
				}),
				on(this.passwordText, 'keyup', function() {
					validatePassword.call(self);
				}),
				on(this.loginButton, 'click', function() {
					deferredUtils.when(request.post(self.config.loginUrl, { preventCache: true, handleAs: 'json', data: { user: self.userNameText.value, password: self.passwordText.value, parameters: {} } }), function(data) {
						/* globals window */
						if (data.result === 'success') {
							self.emit('login', {});
						}
						else {
							window.alert(data.message || 'login failed');
						}
					});
				})
			);
			setTimeout(function() {
				validateUserName.call(self);
				validatePassword.call(self);
				self.userNameText.focus();
			}, 0);
		})
	}, function (config) {
		var self = this;
		this.config = config;
		if (this.config.skin && this.config.skin.login) {
			require(this.config.skin.login, function(skin) {
				self.set('skin', skin);
			});
		}
	});
	return LoginScreen;
});