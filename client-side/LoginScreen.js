define(['ninejs/core/extend', 'ninejs/ui/Widget', './Skin/LoginScreen', 'ninejs/ui/bootstrap/Button', 'ninejs/core/i18n!./resources/i18n.json', 'dojo/on', 'ninejs/ui/utils/setClass', 'ninejs/core/deferredUtils'], function(extend, Widget, defaultSkin, Button, i18n, on, setClass, deferredUtils) {
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
			function validateInput(isValid) {
				var valid = isValid && this.userNameText.value && this.passwordText.value;
				setClass(this.loginIcon, '!valid', '!invalid', '!glyphicon-exclamation-sign', '!glyphicon-check');
				if (valid) {
					setClass(this.loginIcon, 'glyphicon-check', 'valid');
				}
				else {
					setClass(this.loginIcon, 'glyphicon-exclamation-sign', 'invalid');
				}
			}
			function validateUserName() {
				validateInput.call(this);
			}
			function validateUserNameBlur() {
				var deferred = deferredUtils.defer(),
					value = this.userNameText.value;
				if (this.userNameValidation) {
					deferredUtils.when(this.userNameValidation.call(this, value), function(result) {
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
				if (this.passwordValidation) {
					message = this.passwordValidation(this.passwordText.value);	
				}
				setClass(this.passwordIcon, '!valid', '!invalid', '!glyphicon-exclamation-sign', '!glyphicon-check');
				if (!message) {
					setClass(this.passwordIcon, 'glyphicon-check', 'valid');
				}
				else {
					setClass(this.passwordIcon, 'glyphicon-exclamation-sign', 'invalid');
				}
				validateInput.call(this, !message);
			}
			var self = this;
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
				})
			);
			setTimeout(function() {
				validateUserName.call(self);
				validatePassword.call(self);
				self.userNameText.focus();
			}, 0)
		})
	});
	return LoginScreen;
});