'use strict';

import { define as moduleDefine } from 'ninejs/modules/moduleDefine'
import Module from 'ninejs/modules/Module'
import Auth from './Auth'


export default moduleDefine(['router', 'singlePageContainer'], function (unitDefine) {
	unitDefine('ninejs/auth', function (config, router, singlePageContainer) {
		var auth = new Auth(config, router, singlePageContainer);

		return auth;
	});
});
