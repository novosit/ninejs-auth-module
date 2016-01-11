(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", 'ninejs/modules/moduleDefine', './Auth'], factory);
    }
})(function (require, exports) {
    'use strict';
    var moduleDefine_1 = require('ninejs/modules/moduleDefine');
    var Auth_1 = require('./Auth');
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = moduleDefine_1.define(['router', 'singlePageContainer'], function (unitDefine) {
        unitDefine('ninejs/auth', function (config, router, singlePageContainer) {
            var auth = new Auth_1.default(config, router, singlePageContainer);
            return auth;
        });
    });
});
//# sourceMappingURL=module.js.map