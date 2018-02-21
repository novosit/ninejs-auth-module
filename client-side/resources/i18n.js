(function (factory) {
	'use strict';
	var isAmd = typeof (define) === 'function' && define.amd;
	if (isAmd ) {
		define(['./es/i18n'], factory);
	}
	else if (typeof(exports) === 'object') {
		module.exports = factory(require('./es/i18n'));
	}
})(function (es) {
	return {
	"root": {
		"userName": "User Name",
		"signIn": "Sign In",
		"login": "Login",
		"loginGreetingMessage": "Dear user, please sign in",
		"password": "Password",
		"passwordMustHaveFour": "Password must contain at least 4 characters"
	},
	"es": es
};
});