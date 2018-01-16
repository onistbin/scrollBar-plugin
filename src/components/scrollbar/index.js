import './style.css'
import tpl from './tpl.html'

class Component{
    constructor(opts = {}) {
        this.options = opts;
        console.log(opts);
        this.mainBox = this.options.mainBox; 
        this.contentBox = this.options.contentBox;
        this.scrollBarClass = this.options.scrollBarClass;
        this.scrollBarBoxClass = this.options.scrollBarBoxClass;
        this.mouseoverBarBg = this.options.mouseoverBarBg;
        this.scrollBarBg = this.options.scrollBarBg;
        this.scrollBarHoverBg = this.options.scrollBarHoverBg;
    
        this.$mainBox = W(this.mainBox);
        this.$contentBox = W(this.contentBox);

        this.$scrollBar = this._createScrollDom(this.$mainBox, this.scrollBarClass, this.scrollBarBoxClass);

        /**
         * 滚动回调默认方法
         */
        this.scrollCallBack = function (ev) {};
    }
}
export default class ScrollBar extends Component {
    constructor(opts = {}) {
        super(opts);
         /**
         * 初始化后基本不变的一些值
         * 当宽窄屏切换的时候会变
         * CV 即 constant values
         */
        this.CV = {
            mainBoxTop: this.$mainBox.getRect().top,
            mainBoxWidth: this.$mainBox.getRect().width,
            mainBoxHeight: this.$mainBox.getRect().height || 300,
            scrollBarWidth: this.$scrollBar.getRect().width
        };
    
        this.setCancelWheelFlag (true);
        this.setOnMouseWheelEv(false);
    
        /**
         * 初始化滚动条样式
         */
        this.setScrollStyle();

        this._bindEvent();
    }

    _setScrollBarBg (bgColor) {
        this.$scrollBar.css('background', bgColor);
    }


    _bindEvent () {
        let self = this,
            SPEED = 4,
            $doc = W(document),
            $parentNode = this.$scrollBar.parentNode(),
            mainBoxMouseenter = false,
            scrollBarMouseenter = false,
            mouseDown = false;

        /**
         * 滚轮滚动事件
         */
        this.mouseWheel(self.$mainBox, function(data) {
            let mainBoxGetRect = self.$mainBox.getRect(),
                contentBoxGetRect = self.$contentBox.getRect(),
                conTop = -parseInt(self.$contentBox.css('top')) || 0,
                wheelFlag = conTop * SPEED + data,
                flag = wheelFlag / SPEED < 0 ? 0 :  wheelFlag / SPEED;

            wheelFlag = flag <= 0 ? 0 : wheelFlag

            if (flag >= (contentBoxGetRect.height - mainBoxGetRect.height)) {
                flag = (contentBoxGetRect.height - mainBoxGetRect.height);
                wheelFlag = (contentBoxGetRect.height - mainBoxGetRect.height) * SPEED;
            }
            self.setScrollTop({
                top: flag,
                type: 'wheelScroll'
            });
        });

        /*
        * 点击滚动条区域
        */
        $parentNode.on('click', (event) => {
            this.clickScroll(event);
        });
        

        /*
        * 鼠标移入内容区域
        */
        this.$mainBox.on('mouseenter', () => {
            let scrollBarBg = mouseDown ? this.scrollBarHoverBg : this.mouseoverBarBg;
            mainBoxMouseenter = true;
            this._setScrollBarBg(scrollBarBg);
        });

        /*
        * 鼠标移出内容区域
        */
        this.$mainBox.on('mouseleave', () => {
            let scrollBarBg = mouseDown ? this.scrollBarHoverBg : this.scrollBarBg;
            mainBoxMouseenter = false;
            this._setScrollBarBg(scrollBarBg);
        });

        /*
        * 鼠标移入scrollBar
        */
        this.$scrollBar.on('mouseenter', () => {
            this._setScrollBarBg(this.scrollBarHoverBg);
        });

        /*
        * 鼠标移出scrollBar
        */
        this.$scrollBar.on('mouseleave', () => {
            let scrollBarBg = mainBoxMouseenter ? this.mouseoverBarBg : this.scrollBarBg;
            scrollBarMouseenter = false;

            if (mouseDown) {
                this._setScrollBarBg(this.scrollBarHoverBg);
                return;
            }
            this._setScrollBarBg(scrollBarBg);
        });


        /*
        * 鼠标按下左键拖动
        */
        this.$scrollBar.on('mousedown',  (event) => {
            event.preventDefault();
            mouseDown = true;
            scrollBarMouseenter = true;
            this._dragScroll(event);
            this._setScrollBarBg(this.scrollBarHoverBg);
        });

        /*
        * 鼠标松开左键
        */
        $doc.on('mouseup', (ev) => {
            let scrollBarBg = mainBoxMouseenter ? this.mouseoverBarBg : this.scrollBarBg;
            $doc.un('mousemove');
            mouseDown = false;
            if (scrollBarMouseenter) {
                this._setScrollBarBg(this.scrollBarHoverBg);
                return;
            }
            this._setScrollBarBg(scrollBarBg);
        });
    }

    _createScrollDom (mainBox, scrollBarClass, scrollBarBoxClass) {
        let $scrollBox = W('<div></div>'),
            scroll = W('<div></div>'),
            $scroll = W(scroll);

        $scrollBox.appendChild($scroll );
        $scroll .addClass(scrollBarClass);
        $scrollBox.addClass(scrollBarBoxClass);
        mainBox.appendChild($scrollBox);

        return $scroll;
    }

    /*
    * setScrollStyle
    * param {}
    * 设置大小、位置、样式
    */
    setScrollStyle () {
        let CV =  this.CV,
            $parentNode = this.$scrollBar.parentNode(),
            conHeight = this.$contentBox.getRect().height || 1,
            conTop = parseInt(this.$contentBox.css('top')) || 0,
            _width = CV.mainBoxWidth,
            _height = CV.mainBoxHeight,
            _scrollWidth = CV.scrollBarWidth,
            _left = _width - _scrollWidth,
            _scrollHeight = parseInt(_height * (_height / conHeight)),
            _rote = -conTop / conHeight,
            wheelScrollBarTop = Math.ceil(_rote * _height);
        
        $parentNode.css({
            'width': _scrollWidth + 2 + "px",
            'height': _height + "px",
            'left': _left - 2 + "px",
            'position': 'absolute'
        });

        this.$mainBox.css({
            position: 'relative'
        });

        this.$contentBox.css({
            position: 'absolute',
            width: _width - _scrollWidth + "px"
        });

        this.$scrollBar.css({
            'position': "absolute",
            'height': _scrollHeight + "px",
            'top': wheelScrollBarTop + "px"
        });
    }

    /*
    * 拖拽滚动条 dragScroll
    */
    _dragScroll () {
        let self = this,
            CV =  this.CV,
            $doc = W(document),
            clickClientY = event.clientY,
            _scrollTop = this.$scrollBar.getRect().top - this.$mainBox.getRect().top;

        let scrollGo = function (ev) {
            ev.preventDefault();
            let clientY = ev.clientY,
                _t = clientY - clickClientY + _scrollTop,
                scrollBarTop = self.getScrollBarBoundary(_t);

            self.setScrollTop({
                top: scrollBarTop, 
                type: 'dragScroll'
            });
        };

        $doc.on('mousemove', function (ev) {
            scrollGo(ev);
        });

    }
    

    /**
     * 判断滚动条是否到达上下边界
     * @param {*} callback 
     */
    getScrollBarBoundary (scrollBartop) {
        let CV =  this.CV,
            mainBoxHeight = CV.mainBoxHeight,
            scrollBarHeight = this.$scrollBar.getRect().height;
            
        /**
         * 下边界
         */
        scrollBartop = scrollBartop > (mainBoxHeight - scrollBarHeight) ? (mainBoxHeight - scrollBarHeight) : scrollBartop;
        

        /**
         * 上边界
         */
        scrollBartop = scrollBartop <= 0 ? 0 : scrollBartop;

        return scrollBartop;
    }

    /*
    * scroll
    * param callback
    * type function
    * 监听自定义滚动条事件
    */
    scroll (callback) {
        this.scrollCallBack = callback || this.scrollCallBack;
    }


    /*
    * mouseWheel
    * param {$obj, handler}
    * type {$obj, function}
    * 监听自定义滚动条事件
    */
    mouseWheel ($obj, handler) {
        let getWheelData = (ev) => ev.wheelDelta ? ev.wheelDelta : ev.detail * 40,
            mouseWheelVerity = (ev) => this.onMouseWheelEv || this.isBoundary(ev) && this.cancelWheelFlag;

        $obj.on('mousewheel, DOMMouseScroll', (event) => {
            let data = event.type === 'mousewheel' ? -getWheelData(event) : getWheelData(event);
            /**
            * isBoundary,判断是否到达上下边界
            */
            if (mouseWheelVerity(event)) {
                return;
            }
            handler(data);
            event.preventDefault();
        });
    }

    /*
    * onMouseWheelDir
    * param {ev}
    * return  'down' || 'up'
    * 滚轮方向
    */
    onMouseWheelDir (ev) {
        let dir = ev.wheelDelta ? ev.wheelDelta < 0 : ev.Detail > 0; 
        return dir ? 'down' : 'up';
    }

    /**
    * isBoundary value = false则滚动
    * up 里边内容向上
    * down 里边内容向下
    * @type {{ev}}
    * 判断临界条件
    */
    isBoundary (ev) {
        let contentBoxTop = parseInt(this.$contentBox.css('top')),
            contentBoxHeight = this.$contentBox.getRect().height,
            dir = this.onMouseWheelDir(ev),
            downStop = -contentBoxTop >= contentBoxHeight - this.$mainBox.getRect().height,
            upStop = contentBoxTop >= 0;

        let isBoundary = (dir === 'down' && downStop) || (dir === 'up' && upStop);
            
        if (!isBoundary) {
            ev.preventDefault();
        }
        return  isBoundary;
    }

    /**
    * setcancelWheelFlag
    */
    setCancelWheelFlag (val) {
        this.cancelWheelFlag = val;
    }

    setOnMouseWheelEv (val) {
        this.onMouseWheelEv = val;
    }

    /*
    * clickScroll
    * param {ev}
    */
    clickScroll (event) {
        let $target = W(event.target),
            sTop = Dom.getDocRect().scrollY,
            top = this.$mainBox.getRect().top,
            SBT = parseInt(this.$scrollBar.css('top')),
            SBH = this.$scrollBar.getRect().height,
            _top = event.clientY + sTop - top - SBH / 2;

        _top = this.getScrollBarBoundary(_top);

        _top = (_top - SBT < 0) ? (SBT - SBH) : SBT + SBH;

        if ($target.hasClass(this.scrollBarClass)) {
            return;
        }
        this.setScrollTop({
            top: _top, 
            type: 'animateScroll'
        });
    }

    /*
    * setScrollTop
    * param {top, animate}
    */
    setScrollTop (opt) {
        let self = this,
            CV = this.CV;

        let { top, type } = opt;

        let { mainBoxHeight: MBH } = CV;
        
        let CBH = this.$contentBox.getRect().height,
            disH = (MBH - this.$scrollBar.getRect().height) || 1,
            scale = top / disH,
            rote = top / CBH,
            SBH = this.$scrollBar.getRect().height,
            _top = (top + SBH > MBH) ? (MBH - SBH) : top,
            _contentTop = - (CBH - MBH) * scale,
            contentTop = (_contentTop < MBH - CBH) ? (MBH - CBH) : _contentTop;

        let position = ((top) => {
            if (top + SBH >= MBH) {
                _top = MBH - SBH;
                contentTop = MBH - CBH;
            } else if (_top < 0) {
                _top = 0;
            }
            return {
                SBT: _top,
                CBT: contentTop > 0 ? 0 : contentTop
            }
        })();

        switch (type) {
            case 'dragScroll': 
                this.$scrollBar.css({top: position.SBT + "px"});
                this.$contentBox.css({top: position.CBT + "px"});
                break;
                
            case 'animateScroll':
                this.$scrollBar.animate({top: {to : position.SBT + "px"}}, 200);
                this.$contentBox.animate({top: {to : Math.ceil(position.CBT) + "px"}}, 200, function () {
                    self.scrollCallBack({
                        mainBoxWidth: CV.mainBoxWidth,
                        mainBoxHeight: CV.mainBoxHeight,
                        contentBoxHeight: CBH,
                        contentBoxTop: parseInt(self.$contentBox.css('top')),
                        scrollBarHeight: SBH,
                        scrollBarTop: parseInt(self.$scrollBar.css('top'))
                    });
                });
                break;
                
            case 'wheelScroll':
                let wheelCBT = (-top < MBH - CBH) ? (MBH - CBH) : - top,
                    _wheelSBT = Math.ceil(rote * MBH);
                    _wheelSBT = self.getScrollBarBoundary(_wheelSBT);

                this.$scrollBar.css('top', _wheelSBT + "px");  
                this.$contentBox.css('top', wheelCBT + "px");
                break;
        }

        this.scrollCallBack({
            type: type,
            mainBoxWidth: CV.mainBoxWidth,
            mainBoxHeight: CV.mainBoxHeight,
            contentBoxHeight: CBH,
            contentBoxTop: parseInt(self.$contentBox.css('top')),
            scrollBarHeight: SBH,
            scrollBarTop: parseInt(self.$scrollBar.css('top'))
        });
    }
}