define(['ninejs/modules/moduleDefine', './Auth'], function (moduleDefine, Auth) {
	'use strict';
	return moduleDefine.define(['router', 'singlePageContainer'], function (unitDefine) {
		unitDefine('ninejs/auth', function (config, router, singlePageContainer) {
			var auth = new Auth(config, router, singlePageContainer);

			return auth;
		});
	});
});