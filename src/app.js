import './static/css/common.css'
import './static/css/style.css'
import ScrollBar from './components/scrollbar'

import $ from 'jquery'


const App = function () {
    var $showScrollParams = W('#show-scrollparams');
	var scrollBar = new ScrollBar({
        mainBox: '#main', 
        contentBox: '#content', 
        scrollBarClass: 'scrollBar',
        scrollBarBoxClass: 'scrollbox',
        scrollBarBg: '#c2c2c2',
        mouseoverBarBg: '#8a8a8a',
        scrollBarHoverBg: '#515151'
    });
    scrollBar.scroll(function (ev) {
        $showScrollParams.html(`
            <p>type: ${ev.type}</p>
            <p>mainBoxWidth: ${ev.mainBoxWidth}</p>
            <p>mainBoxHeight: ${ev.mainBoxHeight}</p>
            <p>contentBoxHeight: ${ev.contentBoxHeight}</p>
            <p>contentBoxTop: ${ev.contentBoxTop}</p>
            <p>scrollBarHeight: ${ev.scrollBarHeight}</p>
            <p>scrollBarTop: ${ev.scrollBarTop}</p>
        `);
    });
};
new App();
