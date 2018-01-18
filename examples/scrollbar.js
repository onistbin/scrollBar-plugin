/** 
 * ScrollBar Plugin Module
 * wangjianbing@360.cn
 *
 *
 * mainBox: '#main'                     盒子容器，最外层(必须)
 * content: '#content'                  滚动内容部分容器（必须）
 * scrollBar: 'scrollBar',              scrollBar     （必须）
 * hoverBgColor: '#8a8a8a',             hoverBgColor scrollBar hover  scrollBar
 * 
 */


var ScrollBar = function (options) {
    this._init(options);
};

ScrollBar.prototype.varructor = ScrollBar;

/*
* _init
* param {}
*/
ScrollBar.prototype._init = function (options) {
    this.options = options;
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

     /**
     * 初始化后基本不变的一些值
     * 当宽窄屏切换的时候会变
     * CV 即 varant values
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
};


/**
 * 设置scrollBar 背景色
 * @param {*} bgColor 
 */
ScrollBar.prototype._setScrollBarBg = function (bgColor) {
    this.$scrollBar.css('background', bgColor);
}

ScrollBar.prototype._bindEvent = function () {
    var   self = this;
    var   SPEED = 4;  //滚轮速度设置
    var   $doc = W(document);
    var   $parentNode = this.$scrollBar.parentNode();

    var mainBoxMouseenter = false,
        scrollBarMouseenter = false,
        mouseDown = false;

    /*
    * 点击滚动条区域
    */
    $parentNode.on('click', function (event) {
        self.clickScroll(event);
    });

    /*
    * 鼠标移入scrollBar
    */
    this.$scrollBar.on('mouseenter', function () {
        self._setScrollBarBg(self.scrollBarHoverBg);
    });
    
    /*
    * 鼠标移入内容区域
    */
    this.$mainBox.on('mouseenter', function () {
        var   scrollBarBg = mouseDown ? self.scrollBarHoverBg : self.mouseoverBarBg;
        mainBoxMouseenter = true;
        self._setScrollBarBg(scrollBarBg);
    });

    /*
    * 鼠标移出内容区域
    */
    this.$mainBox.on('mouseleave', function () {
        var   scrollBarBg = mouseDown ? self.scrollBarHoverBg : self.scrollBarBg;
        mainBoxMouseenter = false;
        self._setScrollBarBg(scrollBarBg);
    });

    /*
    * 鼠标移出scrollBar
    */
    this.$scrollBar.on('mouseleave', function () {
        var   scrollBarBg = mainBoxMouseenter ? self.mouseoverBarBg : self.scrollBarBg;
        scrollBarMouseenter = false;
        if (mouseDown) {
            self._setScrollBarBg(self.scrollBarHoverBg);
            return;
        }
        self._setScrollBarBg(scrollBarBg);
    });

    /*
    * 鼠标按下左键拖动
    */
    this.$scrollBar.on('mousedown',  function (event) {
        event.preventDefault();
        mouseDown = true;
        scrollBarMouseenter = true;
        self._dragScroll(event);
        self._setScrollBarBg(self.scrollBarHoverBg);
    });

    /*
    * 鼠标松开左键
    */
    $doc.on('mouseup', function (ev) {
        var   scrollBarBg = mainBoxMouseenter ? self.mouseoverBarBg : self.scrollBarBg;

        $doc.un('mousemove');
        mouseDown = false;
        if (scrollBarMouseenter) {
            self._setScrollBarBg(self.scrollBarHoverBg);
            return;
        }
        self._setScrollBarBg(scrollBarBg);
    });

     /**
     * 滚轮滚动事件
     */
    this.mouseWheel(self.$mainBox, function(data) {
        var   mainBoxGetRect = self.$mainBox.getRect();
        var   contentBoxGetRect = self.$contentBox.getRect();
        var     conTop = -parseInt(self.$contentBox.css('top')) || 0,
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
}

/**
 * 创建scroll Dom
 * @param {*} mainBox 
 * @param {*} scrollBarClass 
 * @param {*} scrollBarBoxClass 
 */
ScrollBar.prototype._createScrollDom = function (mainBox, scrollBarClass, scrollBarBoxClass) {
    var $scrollBox = W('<div></div>'),
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
ScrollBar.prototype.setScrollStyle = function () {
    var CV =  this.CV,
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
ScrollBar.prototype._dragScroll = function () {
    var self = this,
        CV =  this.CV,
        $doc = W(document),
        clickClientY = event.clientY,
        _scrollTop = this.$scrollBar.getRect().top - this.$mainBox.getRect().top;

    var scrollGo = function (ev) {
        ev.preventDefault();
        var clientY = ev.clientY,
            _t = clientY - clickClientY + _scrollTop,
            scrollBarTop = self._getScrollBarBoundary(_t);

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
ScrollBar.prototype._getScrollBarBoundary = function (scrollBartop) {
    var mainBoxHeight = this.CV.mainBoxHeight,
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
ScrollBar.prototype.scroll = function (callback) {
    this.scrollCallBack = callback || this.scrollCallBack;
}


/*
* mouseWheel
* param {$obj, handler}
* type {$obj, function}
* 监听自定义滚动条事件
*/
ScrollBar.prototype.mouseWheel = function ($obj, handler) {
    var self = this;
    var getWheelData = function (ev) {
            return ev.wheelDelta ? ev.wheelDelta : ev.detail * 40
        },
        mouseWheelVerity = function (ev) {
            self.onMouseWheelEv || self.isBoundary(ev) && self.cancelWheelFlag
        };

    $obj.on('mousewheel, DOMMouseScroll', function (event) {
        var data = event.type === 'mousewheel' ? -getWheelData(event) : getWheelData(event);
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
ScrollBar.prototype.onMouseWheelDir = function (ev) {
    var dir = ev.wheelDelta ? ev.wheelDelta < 0 : ev.Detail > 0; 
    return dir ? 'down' : 'up';
}

/**
* isBoundary value = false则滚动
* up 里边内容向上
* down 里边内容向下
* @type {{ev}}
* 判断临界条件
*/
ScrollBar.prototype.isBoundary = function (ev) {
    var contentBoxTop = parseInt(this.$contentBox.css('top')),
        contentBoxHeight = this.$contentBox.getRect().height,
        dir = this.onMouseWheelDir(ev),
        downStop = -contentBoxTop >= contentBoxHeight - this.$mainBox.getRect().height,
        upStop = contentBoxTop >= 0;

    var isBoundary = (dir === 'down' && downStop) || (dir === 'up' && upStop);
        
    if (!isBoundary) {
        ev.preventDefault();
    }
    return  isBoundary;
}

/**
* setcancelWheelFlag
*/
ScrollBar.prototype.setCancelWheelFlag = function (val) {
    this.cancelWheelFlag = val;
}

ScrollBar.prototype.setOnMouseWheelEv = function (val) {
    this.onMouseWheelEv = val;
}

/*
* clickScroll
* param {ev}
*/
ScrollBar.prototype.clickScroll = function (event) {
    var $target = W(event.target),
        sTop = Dom.getDocRect().scrollY,
        top = this.$mainBox.getRect().top,
        SBT = parseInt(this.$scrollBar.css('top')),
        SBH = this.$scrollBar.getRect().height,
        _top = event.clientY + sTop - top - SBH / 2;

    _top = this._getScrollBarBoundary(_top);

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
ScrollBar.prototype.setScrollTop = function (opt) {
    var CV = this.CV,
        top = opt.top,
        type = opt.type;

    var dragPos = this._getPos(top);
    switch (type) {
        case 'dragScroll': 
            this._setPosition(dragPos);
            break;

        case 'animateScroll':
            this._setAniPos(type, dragPos);
            break;
            
        case 'wheelScroll':
            var wheelPos = this._getWheelPos(top);
            this._setPosition(wheelPos);
            break;
    }
    var   scrollParams = this._getScrollParams(type);
    this.scrollCallBack(scrollParams);
}

/**
 * 设置滚动条和内容的位置
 * @param {*} position 
 */
ScrollBar.prototype._setPosition = function (position) {
    this.$scrollBar.css({top: position.SBT + "px"});
    this.$contentBox.css({top: position.CBT + "px"});
}

/**
 * 动画方式滚动
 * @param {*} position 
 */
ScrollBar.prototype._setAniPos = function (type, position) {
    var self = this;
    this.$scrollBar.animate({
        top: {
            to : position.SBT + "px"
        }
    }, 200);
    this.$contentBox.animate({
        top: {
            to : Math.ceil(position.CBT) + "px"
        }
    }, 200, function () {
        var   scrollParams = self._getScrollParams(type);
        self.scrollCallBack(scrollParams);
    });
}

/**
 * 滚轮方式获取位置
 * @param {*} top 
 */
ScrollBar.prototype._getWheelPos = function (top) {
    var MBH = this.CV.mainBoxHeight,
        CBH = this.$contentBox.getRect().height,
        rote = top / CBH;

    var wheelCBT = (-top < MBH - CBH) ? (MBH - CBH) : - top,
        _wheelSBT = Math.ceil(rote * MBH);
        _wheelSBT = this._getScrollBarBoundary(_wheelSBT);
            
    return {
        SBT: _wheelSBT,
        CBT: wheelCBT
    }
}

/**
 * 拖拽等方式获取位置
 * @param {*} top 
 */
ScrollBar.prototype._getPos = function (top) {
    var   SBH = this.$scrollBar.getRect().height,
            CBH = this.$contentBox.getRect().height,
            MBH = this.CV.mainBoxHeight,
            disH = (MBH - this.$scrollBar.getRect().height) || 1,
            scale = top / disH;
    
    var     _top = (top + SBH > MBH) ? (MBH - SBH) : top,
            _contentTop = - (CBH - MBH) * scale,
            contentTop = (_contentTop < MBH - CBH) ? (MBH - CBH) : _contentTop;

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
}

/**
 * callback 返回的参数
 * @param {*} type 
 */
ScrollBar.prototype._getScrollParams = function (type) {
    var   CV = this.CV;
    var   $scrollBar = this.$scrollBar;
    var   $contentBox = this.$contentBox;
    return {
        type,
        mainBoxWidth: CV.mainBoxWidth,
        mainBoxHeight: CV.mainBoxHeight,
        contentBoxHeight: $contentBox.getRect().height,
        contentBoxTop: parseInt($contentBox.css('top')),
        scrollBarHeight: $scrollBar.getRect().height,
        scrollBarTop: parseInt($scrollBar.css('top'))
    }
}

