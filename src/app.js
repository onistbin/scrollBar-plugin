import './static/css/common.css'
import './static/css/style.css'
import ScrollBar from './components/scrollbar'

import $ from 'jquery'


const App = function () {
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
        console.log('first scrollbar, scroll event:', ev);
    });
};
new App();
