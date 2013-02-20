/**
 * Scale Image
 */
(function() {
    /*
     * Get a style property (name) of a specific element (elem)
     */
    function getStyle(elem, name) {
        // If the property exists in style[], then it's been set
        // recently (and is current)
        if (elem.style[name])
            return elem.style[name];
        // Otherwise, try to use IE's method
        else if (elem.currentStyle)
            return elem.currentStyle[name];
        // Or the W3C's method, if it exists
        else if (document.defaultView && document.defaultView.getComputedStyle) {
            // It uses the traditional 'text-align' style of rule writing,
            // instead of textAlign
            name = name.replace(/([A-Z])/g, "-$1");
            name = name.toLowerCase();
            // Get the style object and get the value of the property (if it exists)
            var s = document.defaultView.getComputedStyle(elem, "");
            return s && s.getPropertyValue(name);
            // Otherwise, we're using some other browser
        }
        else
            return null;
    }

    /**
     * Find the height of the viewport
     */
    function windowHeight() {
        // A shortcut, in case we're using Internet Explorer 6 in Strict Mode
        var de = document.documentElement;
        // If the innerHeight of the browser is available, use that
        return self.innerHeight ||
            // Otherwise, try to get the height off of the root node
            ( de && de.clientHeight ) ||
            // Finally, try to get the height off of the body element
            document.body.clientHeight;
    }

    function scale() {
        setTimeout(function() {
            var imgs = document.getElementsByTagName('img');
            var imgHeight = parseInt(getStyle(imgs[0], 'height'), 10);
            var imgWidth = parseInt(getStyle(imgs[0], 'width'), 10);
            var wHeight = windowHeight();
            //alert(imgHeight + '|' + imgWidth + '|' + wHeight);

            for (var i = 0; i < imgs.length; ++i) {
                var img = imgs[i];
                img.style.height = wHeight + 'px';
                img.style.width = imgWidth * (wHeight / imgHeight) + 'px';
            }
        }, 100);
    }

    scale();

    window.onresize = scale;
})();