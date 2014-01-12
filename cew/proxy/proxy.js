/**
 * 一个简单的 HTTP Proxy Server 模块
 * @author
 *   1.0 https://github.com/sliuqin @蔡伦
 *   2.0 是 1.0 的简化版 @鬼道
 */

var path = require('path');
var fs = require('fs');
var url = require('url');
var querystring = require('querystring');
var request = require('request');

var UserAgent = {
    'iphone': 'Mozilla/5.0 (iPhone; CPU iPhone OS 5_0 like Mac OS X) AppleWebKit/534.46 (KHTML, like Gecko) Version/5.1 Mobile/9A334 Safari/7534.48.3',
    'iphone3': 'Mozilla/5.0 (iPhone; U; CPU iPhone OS 3_0 like Mac OS X; en-us) AppleWebKit/420.1 (KHTML, like Gecko) Version/3.0 Mobile/1A542a Safari/419.3',
    'iphone4': 'Mozilla/5.0 (iPhone; U; CPU iPhone OS 4_0 like Mac OS X; en-us) AppleWebKit/532.9 (KHTML, like Gecko) Version/4.0.5 Mobile/8A293 Safari/6531.22.7',
    'iphone5': 'Mozilla/5.0 (iPhone; CPU iPhone OS 5_0 like Mac OS X) AppleWebKit/534.46 (KHTML, like Gecko) Version/5.1 Mobile/9A334 Safari/7534.48.3',
    'ipad': 'Mozilla/5.0 (iPad; CPU OS 5_0 like Mac OS X) AppleWebKit/534.46 (KHTML, like Gecko) Version/5.1 Mobile/9A334 Safari/7534.48.3',
    'MQQBrowser': 'MQQBrowser/26 Mozilla/5.0 (Linux; U; Android 2.3.7; zh-cn; MB200 Build/GRJ22; CyanogenMod-7) AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 Mobile Safari/533.1',
    'UC': 'JUC (Linux; U; 2.3.7; zh-cn; MB200; 320*480) UCWEB7.9.3.103/139/999',
    'Firefox': 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:7.0a1) Gecko/20110623 Firefox/7.0a1 Fennec/7.0a1',
    'Opera': 'Opera/9.80 (Android 2.3.4; Linux; Opera Mobi/build-1107180945; U; en-GB) Presto/2.8.149 Version/11.10',
    'BlackBerry': 'Mozilla/5.0 (BlackBerry; U; BlackBerry 9800; en) AppleWebKit/534.1+ (KHTML, like Gecko) Version/6.0.0.337 Mobile Safari/534.1+',
    'WebOS': 'Mozilla/5.0 (hp-tablet; Linux; hpwOS/3.0.0; U; en-US) AppleWebKit/534.6 (KHTML, like Gecko) wOSBrowser/233.70 Safari/534.6 TouchPad/1.0',
    'NokiaN97': 'Mozilla/5.0 (SymbianOS/9.4; Series60/5.0 NokiaN97-1/20.0.019; Profile/MIDP-2.1 Configuration/CLDC-1.1) AppleWebKit/525 (KHTML, like Gecko) BrowserNG/7.1.18124',
    'WindowsPhone': 'Mozilla/5.0 (compatible; MSIE 9.0; Windows Phone OS 7.5; Trident/5.0; IEMobile/9.0; HTC; Titan)'
}

function ValidUrl(str) {
    var regexp = /(((http|ftp|https):\/\/)|www\.)[\w\-_]+(\.[\w\-_]+)+([\w\-\.,@?^=%&amp;:/~\+#!]*[\w\-\@?^=%&amp;/~\+#])?/
    return regexp.test(str);
}

exports.install = function(app) {
    app.get('/proxy/:mode', function(req, res, next) {
        var ua = UserAgent[req.params.mode] || req.get('User-Agent');
        var url = 'http://www.tmall.com';
        try {
            if (req.query.url) {
                url = decodeURI(req.query.url);
            }
        }
        catch (e) {
            url = req.query.url;
        }

        try {
            request.get(url, {
                headers: {
                    'User-Agent': ua
                },
                timeout: 20000,
                encoding: null
            }, function(err, r, body) {
                if (err) {
                    return res.end('无法加载：' + url + '，ERROR:' + err.toString());
                }
                res.set('Content-Type', r.headers['Content-Type'] || r.headers['content-type']);

                res.end(body);
            });
        }
        catch (e) {
            res.end('请重试！');
        }
    });
}
