'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _koaRouter = require('koa-router');

var _koaRouter2 = _interopRequireDefault(_koaRouter);

var _steem = require('steem');

var _steem2 = _interopRequireDefault(_steem);

var _rss = require('rss');

var _rss2 = _interopRequireDefault(_rss);

var _xml = require('xml');

var _xml2 = _interopRequireDefault(_xml);

var _util = require('util');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var getDiscussionsByCreated = (0, _util.promisify)(_steem2.default.api.getDiscussionsByCreated);
var getDiscussionsByFeed = (0, _util.promisify)(_steem2.default.api.getDiscussionsByFeed);
var getDiscussionsByBlog = (0, _util.promisify)(_steem2.default.api.getDiscussionsByBlog);
var getDiscussionsByHot = (0, _util.promisify)(_steem2.default.api.getDiscussionsByHot);
var getDiscussionsByTrending = (0, _util.promisify)(_steem2.default.api.getDiscussionsByTrending);

var router = new _koaRouter2.default({ prefix: '' });

router.get('/:category/:tag', function () {
    var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(ctx, next) {
        return _regenerator2.default.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        ctx.type = 'text/xml';
                        _context.next = 3;
                        return rssGenerator(ctx.params.category, ctx.params.tag);

                    case 3:
                        ctx.body = _context.sent;

                    case 4:
                    case 'end':
                        return _context.stop();
                }
            }
        }, _callee, undefined);
    }));

    return function (_x, _x2) {
        return _ref.apply(this, arguments);
    };
}());

var rssGenerator = function () {
    var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2(category, tag) {
        var feedOption, apiResponse, feed, completedFeed;
        return _regenerator2.default.wrap(function _callee2$(_context2) {
            while (1) {
                switch (_context2.prev = _context2.next) {
                    case 0:
                        feedOption = {
                            title: 'Steemit RSS',
                            feed_url: 'https://steemitrss.com/' + tag,
                            site_url: 'https://steemit.com/created/' + tag,
                            image_url: 'https://steemit.com/images/steemit-share.png',
                            docs: 'https://imkimchi.github.io/steemit-rss'
                        };
                        _context2.next = 3;
                        return getContent(category, tag);

                    case 3:
                        apiResponse = _context2.sent;
                        feed = new _rss2.default(feedOption);
                        _context2.next = 7;
                        return feedItem(feed, apiResponse);

                    case 7:
                        completedFeed = _context2.sent;
                        return _context2.abrupt('return', completedFeed.xml());

                    case 9:
                    case 'end':
                        return _context2.stop();
                }
            }
        }, _callee2, undefined);
    }));

    return function rssGenerator(_x3, _x4) {
        return _ref2.apply(this, arguments);
    };
}();

var methodMap = {
    'feed': function feed(query) {
        return getDiscussionsByFeed(query);
    },
    'blog': function blog(query) {
        return getDiscussionsByBlog(query);
    },
    'new': function _new(query) {
        return getDiscussionsByCreated(query);
    },
    'hot': function hot(query) {
        return getDiscussionsByHot(query);
    },
    'trend': function trend(query) {
        return getDiscussionsByTrending(query);
    }
};

var getContent = function () {
    var _ref3 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3(category, tag) {
        var query;
        return _regenerator2.default.wrap(function _callee3$(_context3) {
            while (1) {
                switch (_context3.prev = _context3.next) {
                    case 0:
                        query = { 'tag': tag, 'limit': 10 };

                        if (!methodMap.hasOwnProperty(category)) {
                            _context3.next = 7;
                            break;
                        }

                        _context3.next = 4;
                        return methodMap[category](query);

                    case 4:
                        return _context3.abrupt('return', _context3.sent);

                    case 7:
                        return _context3.abrupt('return', _promise2.default.reject(new Error("Unknown Category")));

                    case 8:
                    case 'end':
                        return _context3.stop();
                }
            }
        }, _callee3, undefined);
    }));

    return function getContent(_x5, _x6) {
        return _ref3.apply(this, arguments);
    };
}();

var feedItem = function () {
    var _ref4 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee4(feed, response) {
        var _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, post;

        return _regenerator2.default.wrap(function _callee4$(_context4) {
            while (1) {
                switch (_context4.prev = _context4.next) {
                    case 0:
                        console.log(response.length);
                        _iteratorNormalCompletion = true;
                        _didIteratorError = false;
                        _iteratorError = undefined;
                        _context4.prev = 4;
                        for (_iterator = (0, _getIterator3.default)(response); !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                            post = _step.value;

                            feed.item({
                                title: post.title,
                                description: post.body,
                                url: 'https://steemit.com' + post.url,
                                categories: [post.category],
                                author: post.author,
                                date: post.created,
                                custom_elements: [{ 'votes': post.net_votes }, { 'payout_value': post.pending_payout_value }]
                            });
                        }
                        _context4.next = 12;
                        break;

                    case 8:
                        _context4.prev = 8;
                        _context4.t0 = _context4['catch'](4);
                        _didIteratorError = true;
                        _iteratorError = _context4.t0;

                    case 12:
                        _context4.prev = 12;
                        _context4.prev = 13;

                        if (!_iteratorNormalCompletion && _iterator.return) {
                            _iterator.return();
                        }

                    case 15:
                        _context4.prev = 15;

                        if (!_didIteratorError) {
                            _context4.next = 18;
                            break;
                        }

                        throw _iteratorError;

                    case 18:
                        return _context4.finish(15);

                    case 19:
                        return _context4.finish(12);

                    case 20:
                        return _context4.abrupt('return', feed);

                    case 21:
                    case 'end':
                        return _context4.stop();
                }
            }
        }, _callee4, undefined, [[4, 8, 12, 20], [13,, 15, 19]]);
    }));

    return function feedItem(_x7, _x8) {
        return _ref4.apply(this, arguments);
    };
}();

exports.default = router;