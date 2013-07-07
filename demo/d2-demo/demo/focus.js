(function() {
    var S = KISSY, D = S.DOM, E = S.Event,
        subBtn = D.get('#J_Sub'),

        config = {
            content: D.get('#J_Content'),
            urlBox: D.get('#J_Text'),
            showIframeCls: '.j_showIframe',
            macSizeNavCls: '.size',
            macBoxID: '#J_Mac',
            type: D.get('#J_Type'),

            Phone: '<div class="item iphone4s"><iframe class="j_showIframe" src=""></iframe></div>' +
                '<div class="item Android"><iframe class="j_showIframe" src=""></iframe></div>',
            Pad: '<div class="item Pad"><iframe class="j_showIframe" src=""></iframe></div>',
            Mac: '<div class="item"></div>' +
                '<iframe class="j_showIframe" src=""></iframe>' +
                '<div class="macNav"><b class="size" data-size="13">13"</b><b class="size select" data-size="15">15"</b></div>',
            agent: {
                'phone': 'Mozilla/5.0%20%28iPhone%3B%20U%3B%20CPU%20iPhone%20OS%204_0%20like%20Mac%20OS%20X%3B%20xx-xx%29%20AppleWebKit/532.9%20%28KHTML%2C%20like%20Gecko%29%20Version/4.0.5%20Mobile/8A293%20Safari/6531.22.7&device=Apple-Iphone4'
            }
        }


    function CreateTest() {
        this._init()
    }

    CreateTest.prototype = {
        _init: function() {
            var self = this
            if (subBtn) {
                E.on(subBtn, 'click', function(e) {
                    self.Show()
                })

                E.on(config.urlBox, 'keydown', function(e) {
                    if (e.keyCode == 13) {
                        self.Show()
                    }
                })
                this.ChooseType(config.type);
//                this.ChangeMacSize(config.macSizeNavCls)  //mac尺寸选择

                // by 鬼道
                var qs = S.unparam(location.href.indexOf('?') > -1 ? location.href.split('?')[1] : '');
                if (qs.url) {
                    config.urlBox.value = qs.url;
                    subBtn.click();
                }
            }
        },
        CreatQrCode: function(url) {
            var qrBox = D.get('#J_QrCode')
            var qrimgSrc = 'http://chart.apis.google.com/chart?cht=qr&chl=' + url + '&chld=L|0&chs=120x120'
            var qrimgSrc = 'http://ma.taobao.com/api/qrcode.html?activity=encode&text=' + url + '&width=150&height=150&ecLevel=L&characterSet=gbk&t=' + new Date().getTime()
            if (D.attr(qrBox, 'data-init') != 'init') {
                qrBox.innerHTML = '<img id="J_ArCodeImg" src="' + qrimgSrc + '" width="150" height="150" />'
                D.attr(qrBox, 'data-init', 'init')
                D.css(qrBox, {
                    'position': 'fixed',
                    'right': '5px',
                    'top': '50px'
                })
            }
            else {
                D.get('#J_ArCodeImg').src = qrimgSrc
            }

        },
        Show: function() {
            var url = config.urlBox.value, emulateUrl = 'http://www.mobilephoneemulator.com/emulate.php';
            var showUrl = ''
            if (url == '') return;
            showUrl = (url.indexOf('http://') < 0 ? 'http://' : '') + url;
            var box = D.query('.j_showBox'), self = this
            self.CreatQrCode(showUrl)
            var loading = D.create('<div class="loading"></div>')
            S.each(box, function(item) {
                if (D.css(item, 'display') == 'block') {
                    var showList = D.query(config.showIframeCls, item)
                    if (D.attr('.item', 'data-load') != 'init') {
                        D.append(loading, '.item')
                    }
                    else {
                        D.removeClass('.loading', 'hidden')
                    }
//                    if(D.hasClass(item,'phone-box')){
//                        var phoneUrl = emulateUrl+'?url='+ showUrl + '&user_agent='+config.agent.phone;
//                        self.ChangeUrl(showList,phoneUrl)
//                    }else{
                    self.ChangeUrl(showList, showUrl)
//                    }
                }
            })
        },
        ChooseType: function() {
            var showType = '', tar = '', self = this
            E.on('.j_type', 'click', function(e) {
                tar = e.target;
                if (tar.checked == true) {
                    D.removeClass('.type', 'select')
                    D.addClass(D.parent(tar), 'select');
                    D.addClass('.j_showBox', 'hidden')

                    showType = tar.value;
                    var curShowBox = D.get('#J_' + showType);
                    if (D.attr(curShowBox, 'data-init') != 'init') {  //data-show 控制内容是否已经生成
                        curShowBox.innerHTML = config[showType];
                        D.attr(curShowBox, 'data-init', 'init')
                    }
                    var iframe = D.query('iframe', curShowBox)
                    D.removeClass(curShowBox, 'hidden')
                    if (showType == 'Mac') {
                        self.ChangeMacSize(config.macSizeNavCls)
                    }
                    self.Show()
                }
            })
        },
        ChangeUrl: function(elCls, url) {
            S.each(elCls, function(item) {
                if (item.src == url) {
                    return
                }
                item.src = url
            })
        },
        ChangeMacSize: function(elemCls) {
            var clickSize = '', tar = '', nowCls = '', box = ''
            E.on(elemCls, 'click', function(e) {
                tar = e.target
                D.removeClass(elemCls, 'select')
                D.addClass(tar, 'select');
                clickSize = D.attr(tar, 'data-size');
                box = D.get(config.macBoxID)
                nowCls = D.attr(box, 'class')
                D.replaceClass(box, nowCls, 'mac-box j_showBox Mac' + clickSize)

            })
        },
        CreateTemplate: function(type) {

        }
    }

    var test = new CreateTest()
})()
