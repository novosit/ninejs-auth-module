define(['ninejs/core/extend', 'ninejs/ui/Widget', './Skin/LoginScreen', 'ninejs/core/i18n!./resources/i18n.json', 'dojo/on', 'ninejs/ui/utils/setClass', 'ninejs/core/deferredUtils', 'ninejs/request'], function(extend, Widget, defaultSkin, i18n, on, setClass, deferredUtils, request) {
	'use strict';
	var resources = i18n.getResource(),
		LoginScreen;
	LoginScreen = Widget.extend({
		skin: defaultSkin,
		skinContract: {
			validateInput: {
				type: 'function'
			}
		},
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
		onUpdatedSkin: extend.after(function() {
			var self = this;
			function performLogin() {
				return deferredUtils.when(request.post(self.config.loginUrl, { preventCache: true, handleAs: 'json', data: { user: self.userNameText.value, password: self.passwordText.value, parameters: {} } }), function(data) {
					/* globals window */
					if (data.result === 'success') {
						self.passwordText.value = '';
						setTimeout(function () {
							self.emit('login', data);
						}, 0);
					}
					else {
						window.alert(data.message || 'login failed');
					}
					return true;
				}, function(err) {
					console.log(err);
				});
			}
			this.own(
				on(this.loginButton, 'click', performLogin),
				on(this, 'performLogin', performLogin)
			);
			setTimeout(function() {
				self.currentSkin.validateUserName.call(self);
				self.currentSkin.validatePassword.call(self);
				self.userNameText.focus();
			}, 0);
		})
	}, function (_0, config) {
		var self = this;
		this.config = config;
		if (self.config.skin && self.config.skin.login) {
			self.set('skin', self.config.skin.login);
		}
	});
	return LoginScreen;
});