define(['ninejs/ui/Skin', 'ninejs/css!./LoginScreen.css', 'ninejs/nineplate!./LoginScreen.html', 'ninejs/ui/utils/setClass', 'ninejs/core/deferredUtils', 'dojo/on'], function (Skin, css, template, setClass, deferredUtils, on) {
	'use strict';
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
			deferredUtils.when(this.userNameValidation(value), function(result) {
				deferred.resolve(result);
			});
		}
		else {
			deferred.resolve(true);
		}
		return deferredUtils.when(deferred.promise, function(valid) {
			setClass(self.userNameIcon, '!valid', '!invalid', '!glyphicon-exclamation-sign', '!glyphicon-check');
			if (valid) {
				setClass(self.userNameIcon, 'glyphicon-check', 'valid');
			}
			else {
				setClass(self.userNameIcon, 'glyphicon-exclamation-sign', 'invalid');
			}
			return valid;
		});
	}
	function validatePassword() {
		var message = '';
		if (self.passwordValidation) {
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
	return new Skin({
		cssList: [css],
		template: template,
		updated: function(control) {
			control.own(
				on(control.userNameText, 'keyup', function() {
					control.currentSkin.validateUserName.call(control);
				}),
				on(control.userNameText, 'blur', function() {
					control.currentSkin.validateUserNameBlur.call(control);
				}),
				on(control.passwordText, 'keyup', function() {
					control.currentSkin.validatePassword.call(control);
				})
			);
		},

		validateInput: validateInput,
		validateUserName: validateUserName,
		validateUserNameBlur: validateUserNameBlur,
		validatePassword: validatePassword
	});
});