'use strict';

import { define as mdefine } from 'ninejs/modules/moduleDefine'
import Module from 'ninejs/modules/Module'
import Auth from './Auth'

export default mdefine(['ninejs', 'webserver', 'ninejs/auth/impl'], function (provide) {
	provide('ninejs/auth', function (config, ninejs, webserver, impl) {
		var log = ninejs.get('logger');
		log.info('ninejs/auth module starting');
		var auth = new Auth(config, ninejs, webserver, impl);
		return auth;
	});
});
