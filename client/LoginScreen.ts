/// <amd-dependency path="ninejs/core/i18n!./resources/i18n.json" />
'use strict';

import Widget from 'ninejs/ui/Widget'
import Skin from 'ninejs/ui/Skin'
import defaultSkin from './Skin/LoginScreen'
import on from 'ninejs/core/on'
import { when } from 'ninejs/core/deferredUtils'
import request from 'ninejs/request'

declare var require: any;
let i18n = require('ninejs/core/i18n!./resources/i18n.json');

let resources = i18n.getResource();
class LoginScreen extends Widget {
	skin: Skin;
	config: any;
	userNameText: HTMLInputElement;
	passwordText: HTMLInputElement;
	loginButton: HTMLInputElement;
	i18n(key: string) {
		return resources[key];
	}

	userNameValidation(value: string) {
		return !!value;
	}

	passwordValidation(value: string) {
		if (value && value.length > 3) {
			return '';
		}
		else {
			return this.i18n('passwordMustHaveFour');
		}
	}

	onUpdatedSkin() {
		super.onUpdatedSkin();
		var self = this;

		function performLogin() {
			return when(request.post(self.config.loginUrl, {
				preventCache: true,
				handleAs: 'json',
				withCredentials: true,
				data: {user: self.userNameText.value, password: self.passwordText.value, parameters: {}}
			}), function (data) {
				/* globals window */
				if (data.result === 'success') {
					self.passwordText.value = '';
					if (typeof(data.loggedInSince) === 'number') {
						data.loggedInSince = new Date(data.loggedInSince);
					}
					setTimeout(function () {
						self.emit('login', data);
					}, 0);
				}
				else {
					window.alert(data.message || 'login failed');
				}
				return true;
			}, function (err) {
				console.log(err);
			});
		}

		this.own(
				on(this.loginButton, 'click', performLogin),
				on(this, 'performLogin', performLogin)
		);
		setTimeout(function () {
			var skin: any = self.currentSkin;
			skin.validateUserName.call(self);
			skin.validatePassword.call(self);
			self.userNameText.focus();
		}, 0);
	}

	constructor (_0: any, config: any) {
		super(_0);
		var self = this;
		this.config = config;
		if (self.config.skin && self.config.skin.login) {
			self.set('skin', self.config.skin.login);
		}
	}
}
LoginScreen.prototype.skinContract = {
	'validateInput': {
		type: 'function'
	}
};
LoginScreen.prototype.skin = defaultSkin;
export default LoginScreen;