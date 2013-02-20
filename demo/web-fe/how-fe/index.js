(function() {
    var imgs = document.getElementsByTagName('img');

    for (var i = 0; i < imgs.length; ++i) {
        var img = imgs[i];

        img.style.display = 'none';
        // FIXME 高度未填充满屏幕

        //img.addEventListener('click', next, false);
        // FIXME 事件绑定浏览器兼容性
        img.addEventListener
            ? img.addEventListener('click', next, false)
            : img.attachEvent('onclick', next);
    }

    var count = -1;

    /**
     * 图片切换
     */
    function next() {
        count = ++count % imgs.length;
        var display;
        for (var i = 0; i < imgs.length; ++i) {
            display = count === i ? 'block' : 'none';
            imgs[i].style.display = display;
        }
    }

    next();
})();