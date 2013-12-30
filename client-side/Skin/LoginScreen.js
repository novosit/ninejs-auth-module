define(['ninejs/ui/Skin', 'ninejs/css!./LoginScreen.css', 'ninejs/nineplate!./LoginScreen.html'], function (Skin, css, template) {
	'use strict';
	return new Skin({
		cssList: [css],
		template: template
	});
});