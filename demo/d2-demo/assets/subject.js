KISSY.Config.debug = true;

/**
 * 实用工具模块
 *
 * @author luics (guidao)
 * @version 1.0.0
 * @date 5/15/13 5:04 PM
 */

KISSY.add('sub/util', function(S) {
    S.log('sub/util loaded');
    var U = {
        log: function() {
            S.log.call(null, arguments);
        },
        fm: function() {
            if (arguments.length == 0) {
                return '';
            } else if (arguments.length == 1) {
                return arguments[0];
            }

            var res = arguments[0], i;
            for (i = 1; i < arguments.length; ++i) {
                var re = new RegExp('\\{' + (i - 1) + '\\}', 'g');
                res = res.replace(re, arguments[i]);
            }
            return res;
        }
    };

    return U;
});

/**
 * 页面定位器 - Locator
 *
 * @author luics (guidao)
 * @version 1.0.0
 * @date 5/14/13 11:23 AM
 */
KISSY.add('sub/locator', function(S, U) {
    S.log('sub/locator loaded');
    var loc = {};

    /**
     * 获取当前page
     *
     * @param {string} [url]
     * @return {String}
     */
    loc.getView = function(url) {
        url = url || location.href;

        var ms = /#!(\w+?)(~|$)/.exec(url);
        U.log(ms);
        var page = '';
        if (ms && ms.length >= 2) {
            page = ms[1];
        }

        return page;
    };

    return loc;
}, {
    requires: ['sub/util']
});

KISSY.use('sub/locator, sub/util', function(S, Locator, U) {
    U.log('sub loaded');
    if (!document.querySelectorAll) {
        return;
    }
    var $body = document.getElementsByTagName('body');
    if ($body && $body.length > 0) {
        $body = S.one($body[0]);
    } else {
        return;
    }

    var imgs = document.querySelectorAll('ul#showCase li img');
    var links = document.querySelectorAll('ul#showCase li .allOver .hosarea');
    var html = ['<div class="subject-viewport">'];
    html.push(U.fm('<div class="subject-content" style="width:{0}px;">', 320 * imgs.length));
    S.each(imgs, function(img, i) {
        var $img = S.one(img);
        var $link = S.one(links[i]);
//        html.push(U.fm('<div class="subject-item"><a href="{2}"><img width="300" height="625" data-view="{1}" alt="image {1}" src="{0}" /></a></div>',
        html.push(U.fm('<div class="subject-item"><img onclick="location.href=\'{2}\'" width="300" height="625" data-view="{1}" alt="image {1}" src="{0}" /></div>',
            $img.attr('src'), i, $link.attr('href')));
    });
    html.push('</div></div>');

    $body.append(html.join(''));

    // slide
    S.one('.subject-viewport').height(S.one(window).height());
    var flipsnap = Flipsnap('.subject-content');
    var view = parseInt(Locator.getView(), 10); // NaN的情况
    // 只在页面加载时触发
    if (view > 0) {
        flipsnap.moveToPoint(view);
    }

    flipsnap.element.addEventListener('fstouchend', function(ev) {
        S.log('fstouchend');

        var curView = parseInt(Locator.getView(), 10); // NaN的情况
        var newView = ev.newPoint;
        if (curView != newView) {
            location.hash = '!' + newView;
        }
    }, false);

    //改写url，保存至hashbang, #!\d
    /*flipsnap.element.addEventListener('fspointmove', function() {
        S.log('fspointmove');
    }, false);

    flipsnap.element.addEventListener('fstouchstart', function() {
        S.log('fstouchstart');
    }, false);
    flipsnap.element.addEventListener('fstouchmove', function(ev) {
        ev.delta;     //=> delta x value, given px
        ev.direction; //=> direction value, 1 or -1
        //S.log('fstouchmove');
    }, false);
    flipsnap.element.addEventListener('fstouchmove', function(ev) {
        //S.log('fstouchmove');
//        if (ev.direction === -1) {
//            ev.preventDefault(); // cancel touchmove event and fire touchend event.
//        }
   })*/
});