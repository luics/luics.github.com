/*

 mouse wheel plugin

 Switch slide when mouse wheel event is toggled.

 Add to the slideshow:

 dependencies: [
 ...
 { src: 'plugin/wheel/wheel.js', async: true }
 ]

 */

(function() {
    if (window.addEventListener) {
        // chrome only, 测试环境chrome24
        window.onmousewheel = function(e) {
            //console.log('onmousewheel', e);
            e.wheelDeltaY < 0 ? Reveal.next() : Reveal.prev();
        };

        // firefox only, 测试环境firefox18
        window.addEventListener('DOMMouseScroll', function(e) {
            //console.log(e);
            e.detail > 0 ? Reveal.next() : Reveal.prev();
        }, false);
    }
}());