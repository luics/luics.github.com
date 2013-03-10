/**
 * @author luics(luics.xu@gmail.com)
 * @date 2013-03-10
 */

$(function() {
    var $window = $(window);
    var $body = $(document.body);
    var $toolkit = $('#toolkit');
    $window.scroll(function(e) {
        //console.log('onscroll', $window.scrollTop(), $body.height(), $window.height());

        if ($toolkit.css('display') === 'none') {
            //console.log('toolkit display:none');
            if ($window.scrollTop() > $body.height() - $window.height()) {
                //console.log('toolkit expand');
                $toolkit.fadeIn(3000);
            }
        }
    });
});