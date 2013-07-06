/**
 * Util
 *
 * @author luics (guidao)
 * @version 1.0.0
 * @date 5/20/13 5:49 PM
 */

/**
 * Import list
 * @type {Array}
 */
var __IMPORT = [
    // 公共组件
    'xtemplate',
    'mui/pagination',
    'mui/pagination/themes/default'
];

KISSY.add('tmallpromotion/util', function(S, XTemplate, Pager, PagerTemplate) {
    S.log('tmallpromotion/util loaded');

    var RE_URL_SEG = /^(https?:\/\/.+?)(\?(.*?))?(#(.*?))?$/;
    var Seed = {
        /**
         * 封装 window.console.log，使用 S.Config.debug 开关控制 log 是否打印
         */
        log: function() {
            if (!S.Config.debug) {
                return;
            }

            // TODO var con = window.console; 赋值有风险？
            // 遇到过 var $ = document.querySelectorAll, 之后$为undefined $()
            if (window.console && window.console.log) {
                S.isFunction(window.console.log) && window.console.log.apply(window.console, arguments);
            }
        },
        /**
         * 字符串格式化
         *
         * Usage：
         *   fm('{0}-{1}', 1, '2') // 结果：1-2
         *   fm('{0}-{1}-{0}', 1, '2') // 结果：1-2-1
         *
         * @returns {string}
         */
        fm: function() {
            if (arguments.length == 0) {
                return '';
            }
            else if (arguments.length == 1) {
                return arguments[0];
            }

            var res = arguments[0], i;
            for (i = 1; i < arguments.length; ++i) {
                var re = new RegExp('\\{' + (i - 1) + '\\}', 'g');
                res = res.replace(re, arguments[i]);
            }
            // TODO 性能优化版本
            return res;
        },
        /**
         * Url 基础切分
         * @param {string} url 目前支持http(s)协议
         * @returns {Object}
         */
        segment: function(url) {
            var obj = {
                url: '',
                qs: '',
                hash: ''
            };

            //考虑 null、unefined 等情况，需要做这个处理
            if (!url) {
                return obj;
            }
            url += '';

            var ms = RE_URL_SEG.exec(url);
            //U.log(ms);
            if (!ms) {
                return obj;
            }

            obj.url = ms[1] ? ms[1] : '';
            obj.qs = ms[3] ? ms[3] : '';
            obj.hash = ms[5] ? ms[5] : '';
            return obj;
        },
        /**
         * S.unparam的封装，增加对url的直接支持
         * @param {string} [url]
         * @returns {Object}
         */
        unparam: function(url) {
            url = url || location.href;
            return S.unparam(U.segment(url).qs);
        }
    };

    var U = Seed;

    /**
     * loading 控制
     * @param {Object} [opt]
     * @param {boolean} opt.hide
     */
    U.loading = function(opt) {
        opt = opt || {};
        var $loading = S.one('.ui-loading');
        if (!$loading) {
            S.one(document.body).append('<div class="ui-loading loading"></div>');
            $loading = S.one('.ui-loading');
        }
        opt.hide ? $loading.hide() : $loading.show();
    };

    /**
     *
     */
    U.alert = function() {
        alert(Array.prototype.join.call(arguments, ' '));
    };

    /**
     * 封装 KISSY.ajax，增加 mock data 支持
     *
     * Usage 参见 Unit Test ../tests/test.util.js
     *
     * @param {Object} opt
     * @param {string} [opt._mockUrl] mock data url
     * @param {string} [opt._loading] loading 容器的选择器
     *
     * @param {string} opt.url
     * @param {function} [opt.success]
     * @param {Object} [opt.data]
     * @param {string} [opt.type]
     * @param {string} [opt.dataType]
     * @param {number} [opt.timeout]
     * @param {function} [opt.error]
     * @param {function} [opt.complete]
     * @param {string} [opt.scriptCharset]
     *
     * @see 参数详细定义请参见 KISSY.ajax 源码
     */
    U.ajax = function(opt) {
        var success = opt.success;
        var complete = opt.complete;

        if (!U.ajax.__called) {
            U.ajax.__called = true;
            // TODO global ajax error handler
//                    $(document).ajaxError(function(event, request, settings) {
//                        console.log(event, request, settings);
//                        mf.msg('网络异常，请尝试稍后操作<br>'); //;+ JSON.stringify(event)
//                    });
        }

        /**
         * 处理服务器返回的数据
         *
         * @param {Object} result 服务器返回json解析后的对象
         * @param {Object} result.success 服务器状态，是否成功
         * @param {Object} result.model 返回的数据
         * @param {string} result.model.redirect 重定向url
         * @param {string} result.model.sessionTimeout 会话超时
         */
        function ondata(result) {
            U.log('U.ajax ondata', result);
            var model = result.model;
            if (!result.success && !model.formError) {//非表单错误处理
                if (model.global) {
                    U.alert(model.global);
                }
                else if (model.sessionTimeout) {
                    // TODO 会话超时处理
                }
                else if (model.redirect) {
                    location.href = model.redirect;
                }
                else if (model.error) {
                    U.log('ondata error: ', model.error);
                }
                else {
                    U.alert('未知错误，请联系我们的客服');
                }
            }

            success && success(result);
        }

        // opt rewriting
        if (S.Config.debug) {
            opt.type = 'post';
            opt.dataType = 'script';
            //opt.scriptCharset = 'gbk';

            var query = '';
            var path = opt.url;
            if (opt.url.indexOf('?') >= 0) {
                var seg = opt.url.split('?');
                path = seg[0];
                query = seg[1];
            }
            var filename = path.substring(path.lastIndexOf('/') + 1, // 必须包含路径
                (path.lastIndexOf('.') >= 0 ? path.lastIndexOf('.') : path.length));
            path = U.fm('data/{0}.js{1}', filename, (query ? '?' + query : ''));
            opt.url = opt._mockUrl ? opt._mockUrl : path;

            opt.success = function() {
                ondata(exports.response);
            };
        }
        else {
            opt.type = opt.type || 'post';
            opt.dataType = opt.dataType || 'json';
            opt.success = function(data) {// 后端字符编码是 gbk
                ondata(data);
            };
        }


        /*S.each(opt.data, function(v, k) {
         opt.data[k] = encodeURIComponent(opt.data[k]);
         })*/
        opt.timeout = opt.timeout || 3;
        opt.error = opt.error || function(textStatus) {
            U.log(textStatus);
        };

        U.loading();
        opt.complete = function(textStatus) {
            U.loading({hide: true});

            complete && complete(textStatus);
        };

        U.log('U.ajax', opt);
        S.ajax(opt);
    };


    /**
     * 获取当前page
     *
     * @param {string} [url]
     * @returns {String}
     */
    U.getView = function(url) {
        url = url || location.href;

        var ms = /#!(\w+?)(~|$)/.exec(url);
        //U.log('getView', ms);
        var page = '';
        if (ms && ms.length >= 2) {
            page = ms[1];
        }

        return page;
    };

    /**
     * 平台判断
     * @type {Object}
     */
    U.platform = {};
    var ua = navigator.userAgent;
    U.platform.android = /android/i.test(ua);
    U.platform.iphone = /iphone/i.test(ua);
    U.platform.ipad = /ipad/i.test(ua);

    /**
     * List class
     * @constructor
     * @param {Object} opt
     * @param {string} opt.container Container selector
     * @param {Object} opt.template XTemplate instance
     * @param {boolean} [opt.hidePager]
     * @param {number} [opt.pageSize] 每页展示记录数
     * @param {Object} [opt.events]
     * @param {Function} [opt.events.operated] 操作触发（单个或批操作）
     * @param {Function} [opt.events.pageChanged] 页码改变
     */
    var List = U.List = function(opt) {
        var me = this;
        me._template = opt.template; // TODO 可以扩展出中间模板
        me._hidePager = !!opt.hidePager;
        me._events = opt.events || {};
        me._pageSize = opt.pageSize || 10;

        var wrap = S.one(opt.container);
        me._listContainer = S.one('<div></div>').appendTo(wrap);
    };

    S.augment(List, {
        /**
         * 事件触发
         * @param {string} eventName
         */
        fire: function(eventName) {
            var me = this;
            var handler = me._events[eventName];
            S.isFunction(handler) && handler.apply(me, Array.prototype.splice.call(arguments, 1));
        },
        /**
         * 表单刷新
         * @public
         * @param {Object} list 格式请参见 http://work.tmall.net/projects/tsp/wiki/Interface#成功
         */
        refresh: function(list) {
            var me = this;
            var listContainer = me._listContainer;

            listContainer.html(me._template.render(list));
            me._refreshPager(Math.floor(list.totalSize / me._pageSize));

            var operateAll = listContainer.one('.j_UiListOperateAll');
            var operates = listContainer.all('.j_UiListOperate');
            var checkAll = listContainer.one('.j_UiListCheckAll');
            var checks = listContainer.all('.j_UiListCheck');

            function toggleOperateAll() {
                if (!checks || !operateAll) {
                    return;
                }
                S.each(checks, function(check) {
                    var checked = !!S.one(check).attr('checked');
                    checked ? operateAll.removeClass('ui-btn-disable') : operateAll.addClass('ui-btn-disable');
                    return !checked;
                });
            }

            // check
            if (checkAll && checks) {
                checkAll.on('change', function() {
                    U.log('check all');
                    var checked = checkAll.attr('checked');
                    checked ? checks.attr('checked', true) : checks.removeAttr('checked');
                    toggleOperateAll();
                });
                checks.on('change', function() {
                    U.log('check', this);
                    toggleOperateAll();
                });
            }
            // operation
            if (operateAll) {
                operateAll.on('click', function() {
                    var data = [];
                    S.each(checks, function(check) {
                        check = S.one(check);
                        var checked = !!check.attr('checked');
                        // 由于tr可能被删除，应该使用check的 data-index
                        checked && data.push(list.data[check.attr('data-index')]);
                    });
                    me.fire('operated', data);
                });
            }
            if (operates) {
                operates.on('click', function() {
                    var operate = S.one(this);
                    // TODO 优化 data-index 至全行可访问，有必要做二次模板？
                    me.fire('operated', [list.data[parseInt(operate.attr('data-index'), 10)]]);
                });
            }
        },
        /**
         * 刷新Pager
         * @private
         * @param {number} totalPage
         */
        _refreshPager: function(totalPage) {
            var me = this;
            if (me._hidePager) {
                return;
            }

            var pager = me._pager;
            if (!pager) {
                me._pagerContainer = S.one('<div class="ui-list-pager"></div>').insertAfter(me._listContainer);
                me._pager = pager = new Pager({
                    container: me._pagerContainer,
                    currentPage: 1,
                    totalPage: totalPage,
                    loadCurrentPage: false,
                    template: PagerTemplate,
                    ellipseText: true,
                    callback: function(idx, pg, ready) {
                        ready(idx);
                        return false;
                    },
                    events: {
                        'J_MuiModuleJumpto': {
                            'click': function(e) {
                                e.preventDefault();
                                var page = this.get('container').one('.J_MuiModulePageIpt').val();
                                var total = this.get("totalPage");
                                page > total && (page = total);
                                page < 1 && (page = 1);
                                this.page(page);
                            }
                        }
                    }
                });
                S.Event.delegate(pager.get('container'), 'submit', 'form', function(e) {// 阻止pager在ie6下的表单提交
                    e.preventDefault();
                });
                pager.on("afterPageChange", function(e) {
                    me.fire('pageChanged', e.idx);
                });
            }

            var pagerContainer = me._pagerContainer;
            if (totalPage > 1) {
                var beforeTotalPage = pager.get("totalPage");
                U.log('total', totalPage, 'before', beforeTotalPage);
                if (beforeTotalPage != totalPage) {
                    pager.set("totalPage", totalPage);
                    pager.update();
                }
                pagerContainer.show();
            }
            else {
                pagerContainer.hide();
            }
        },
        /**
         * 获取 Pager 实例
         */
        getPager: function() {
            var me = this;
            return me._pager;
        }
    });

    /**
     * Select class
     * 目前提供一写静态方法
     */
    var Select = U.Select = {};

    /**
     * @param {string|number} id
     * @param {Array} data, like [{id:1,name:'ab'},{id:2,name:'cd'}]
     * @returns {string}
     */
    Select.getName = function(id, data) {
        var name = '';
        S.each(data, function(record) {
            if (record.id == id) {
                name = record.name;
                return true;
            }
        });
        return name;
    };

    var OPTION_TPL = new XTemplate('<option {{{selected}}} value="{{id}}">{{{name}}}</option>');

    /**
     * @param {Object} opt
     * @param {Array} opt.data like [{id:1,name:'ab'},{id:2,name:'cd'}]
     * @param {string} [opt.allName] 默认为”全部选择“
     * @param {string} [opt.allId] 默认为空串
     * @returns {string}
     */
    Select.getHtml = function(opt) {
        var html = [];
        html.push(OPTION_TPL.render({
            id: opt.allId ? opt.allId : '',
            name: opt.allText ? opt.allText : '全部选择',
            selected: 'selected'
        }));
        S.each(opt.data, function(category) {
            html.push(OPTION_TPL.render({id: category.id, name: category.name, selected: ''}));
        });
        //itemCat.val(''); TODO ie6不生效？
        //itemCat.getDOMNode().selectedIndex = 0;
        return html.join('');
    };

    /**
     * S.merge 扩展，支持深度遍历的完整merge
     * ！前提条件：结构上，src是dest的子集
     * @param {Object} dest
     * @param {Object} src
     * @returns {Object} dest
     */
    U.deepMerge = function(dest, src) {
        if (!S.isObject(dest) || !S.isObject(src)) {
            return dest;
        }
        
        S.each(src, function(v, k) {
            if (S.isObject(dest[k])) {
                U.deepMerge(dest[k], v);
            }
            else {
                dest[k] = v;
            }
        });
        
        return dest;
    };

    return U;
}, {
    requires: __IMPORT
});