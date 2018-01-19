'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _toConsumableArray2 = require('babel-runtime/helpers/toConsumableArray');

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _koaCompose = require('koa-compose');

var _koaCompose2 = _interopRequireDefault(_koaCompose);

var _tag = require('./tag');

var _tag2 = _interopRequireDefault(_tag);

var _steem = require('steem');

var _steem2 = _interopRequireDefault(_steem);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_steem2.default.api.setOptions({ url: 'https://api.steemit.com/' });
var routes = [_tag2.default];

exports.default = function () {
  var _ref;

  return (0, _koaCompose2.default)((_ref = []).concat.apply(_ref, (0, _toConsumableArray3.default)(routes.map(function (r) {
    return [r.routes(), r.allowedMethods()];
  }))));
};