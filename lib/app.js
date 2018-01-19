'use strict';

require('babel-polyfill');

var _koa = require('koa');

var _koa2 = _interopRequireDefault(_koa);

var _koaStatic = require('koa-static');

var _koaStatic2 = _interopRequireDefault(_koaStatic);

var _koaLogger = require('koa-logger');

var _koaLogger2 = _interopRequireDefault(_koaLogger);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _routes = require('./routes');

var _routes2 = _interopRequireDefault(_routes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var app = new _koa2.default();
var port = process.env.PORT || 3000;
var dist = _path2.default.join(__dirname, '..', 'dist');

app.use((0, _koaLogger2.default)()).use((0, _routes2.default)()).use((0, _koaStatic2.default)(dist));

app.listen(port, function () {
  return console.log('[!] Server is Running on ' + port);
});