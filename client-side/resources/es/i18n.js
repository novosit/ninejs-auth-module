(function (factory) {
	'use strict';
	var isAmd = typeof (define) === 'function' && define.amd;
	if (isAmd ) {
		define([], factory);
	}
	else if (typeof(exports) === 'object') {
		module.exports = factory();
	}
})(function () {
	return {
	"userName": "Nombre de Usuario",
	"signIn": "Ingresar",
	"login": "Inicio",
	"loginGreetingMessage": "Por favor ingresar",
	"password": "Contraseña",
	"passwordMustHaveFour": "Su contraseña debe contener al menos 4 caracteres"
};
});