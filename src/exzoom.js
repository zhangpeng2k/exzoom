;(function ($, window) {
    var ele = null,
        boxEle = null,
        boxWidth = null,
        boxHeight = null,
        navEle = null,
        navEleInner = null,
        navHightClass = "current",//当前图片的类,
        navEleSpan = null,
        navHeightWithBorder = null,
        images = null,
        prevBtn = null,//导航上一张图片
        nextBtn = null,//导航下一张图片
        imgNum = 0,//图片的数量
        imgIndex = 0,//当前图片的索引
        imgArr = [],//图片属性的数字
        moveIndex = 0,//缩略图导航索引
        zoomZone = null,
        mainImg = null,
        mainImgOuter = null,
        previewBox = null,//预览区域
        previewBoxImg = null,//预览区域的图片
        autoPlayNavIndex = 0,//自动播放的图片索引
        autoPlayInterval = null,//用于控制自动播放的间隔时间
        g = {},//全局变量
        defaults = {
            "navWidth": 60,//列表每个宽度,该版本中请把宽高填写成一样
            "navHeight": 60,//列表每个高度,该版本中请把宽高填写成一样
            "navItemNum": 5,//列表显示个数
            "navItemMargin": 7,//列表间隔
            "navBorder": 1,//列表边框，没有边框填写0，边框在css中修改
            "autoPlay": true,//是否自动播放
            "autoPlayTimeout": 2000,//播放间隔时间
        };


    var methods = {
        init: function (options) {
            var opts = $.extend({}, defaults, options);

            ele = this;
            boxEle = ele.find(".exzoom_img_box");
            navEle = ele.find(".exzoom_nav");
            prevBtn = ele.find(".exzoom_prev_btn");//缩略图导航上一张按钮
            nextBtn = ele.find(".exzoom_next_btn");//缩略图导航下一张按钮

            boxHeight = boxWidth = boxEle.parent().width();
            g.navWidth = opts.navWidth;
            g.navHeight = opts.navHeight;
            g.navBorder = opts.navBorder;
            g.navItemMargin = opts.navItemMargin;
            g.navItemNum = opts.navItemNum;
            g.autoPlay = opts.autoPlay;
            g.autoPlayTimeout = opts.autoPlayTimeout;

            images = boxEle.find("img");
            imgNum = images.length;

            navEle.append("<p class='nav_ele_inner' style='position:absolute;left:0;top:0;margin: 0'></p>");
            navEleInner = navEle.find("p");

            for (var i = 0; i < imgNum; i++) {
                imgArr[i] = copute_image_prop(images.eq(i));
            }
            images.remove();

            navEleSpan = navEle.find("span");
            navHeightWithBorder = g.navBorder * 2 + g.navHeight;
            g.navEleWidth = (navHeightWithBorder + g.navItemMargin) * g.navItemNum;
            g.navEleInnerWidth = (navHeightWithBorder + g.navItemMargin) * imgNum;

            navEleSpan.eq(imgIndex).addClass(navHightClass);
            navEle.css({
                "height": navHeightWithBorder + "px",
                "width": boxHeight - 25 + "px",
            });
            navEleInner.css({
                "width": g.navEleInnerWidth + "px"
            });
            navEleSpan.css({
                "margin-left": g.navItemMargin + "px",
                "width": g.navWidth + "px",
                "height": g.navHeight + "px",
            });

            //大图和预览区域部分
            boxEle.append("<div>" +
                "<b style='display:block;'><img src='' class='exzoom_main_img'/></b>" +
                "<span style='position:absolute;left:0;top:0;display:none;z-index:5;'></span>" +
                "</div>" +
                "<p class='exzoom_preview' style='top:0;display:none;'>" +
                "<img class='exzoom_preview_img' style='max-width:none;max-height:none;left:0;top:0;' src='' />" +
                "</p>");

            zoomZone = boxEle.find("span");
            mainImg = boxEle.find(".exzoom_main_img");
            mainImgOuter = boxEle.find("div");
            previewBox = boxEle.find("p");
            previewBoxImg = boxEle.find(".exzoom_preview_img");

            boxEle.css({
                "width": boxHeight + "px",
                "height": boxHeight + "px",
            });

            previewBox.css({
                "width": boxHeight + "px",
                "height": boxHeight + "px",
                "left": boxHeight + 10 + "px"
            });

            previewImg(imgArr[imgIndex]);
            autoPlay();//自动播放
            bindingEvent();//绑定事件
        },
        /* prev: function () {             //上一张图片
             moveLeft()
         },
         next: function () {            //下一张图片
             moveRight();
         },*/
        setImg: function () {            //设置大图
            var url = arguments[0];

            getImageWidth(url, function (width, height) {
                previewBoxImg.attr("src", url);
                mainImg.attr("src", url);

                var image_prop = copute_image_prop(url, width, height);
                previewImg(image_prop);
            });
        },
    };

    $.fn.extend({
        "exzoom": function (method, options) {
            if (arguments.length === 0 || (typeof method === 'object' && !options)) {
                if (this.length === 0) {
                    // alert("调用 jQuery.exzomm 时的选择器为空");
                    $.error('Selector is empty when call jQuery.exzomm');
                } else {
                    return methods.init.apply(this, arguments);
                }
            } else if (methods[method]) {
                return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
            } else {
                // alert("调用了 jQuery.exzomm 中不存在的方法");
                $.error('Method ' + method + 'does not exist on jQuery.exzomm');
            }
        }
    });

    /**
     * 绑定事件
     */
    function bindingEvent() {
        //进入进入大图区域
        mainImgOuter.on("mouseenter", function () {
            window.clearInterval(autoPlayInterval);//停止自动播放
            zoomZone.css("display", "block");
            previewBox.css("display", "block");
        });

        //在大图区域移动
        mainImgOuter.on("mousemove", function (e) {
            var width_limit = zoomZone.width() / 2,
                max_X = mainImgOuter.width() - width_limit,
                max_Y = mainImgOuter.height() - width_limit,
                current_X = e.pageX - mainImgOuter.offset().left,
                current_Y = e.pageY - mainImgOuter.offset().top,
                move_X = current_X - width_limit,
                move_Y = current_Y - width_limit;

            if (current_X <= width_limit) {
                move_X = 0;
            }
            if (current_X >= max_X) {
                move_X = max_X - width_limit;
            }
            if (current_Y <= width_limit) {
                move_Y = 0;
            }
            if (current_Y >= max_Y) {
                move_Y = max_Y - width_limit;
            }
            zoomZone.css({"left": move_X + "px", "top": move_Y + "px"});

            previewBoxImg.css({
                "left": -move_X * previewBox.width() / zoomZone.width() + "px",
                "top": -move_Y * previewBox.width() / zoomZone.width() + "px"
            });
        });

        //离开大图区域
        mainImgOuter.on("mouseleave", function () {
            autoPlay();//恢复自动播放
            zoomZone.css("display", "none");
            previewBox.css("display", "none");
        });


        //进入缩略图区域停止自动播放
        navEle.on("mouseenter", function () {
            window.clearInterval(autoPlayInterval);
        });
        //离开缩略图区域恢复自动播放
        navEle.on("mouseleave", function () {
            autoPlay();
        });

        //缩略图导航
        if (imgNum <= g.navItemNum) {
            navEleInner.css("left", (g.navItemNum - imgNum) * navHeightWithBorder / 2 + "px");
        }
        nextBtn.on("click", function () {
            moveRight();
        });
        prevBtn.on("click", function () {
            moveLeft();
        });

        navEleSpan.hover(function () {
            focusNavImg($(this).index());
        });
    }

    /**
     * 聚焦在导航图片上
     * @param imgIndex
     */
    function focusNavImg(imgIndex) {
        navEleSpan.eq(imgIndex).addClass(navHightClass).siblings().removeClass(navHightClass);
        previewImg(imgArr[imgIndex]);
    }

    /**
     * 导航向右
     */
    function moveRight() {
        console.log(66);
        if (imgNum <= g.navItemNum) {
            imgIndex++;
            if (imgIndex >= imgNum) {
                imgIndex = imgNum - 1;
            }
            navEleSpan.eq(imgIndex).addClass(navHightClass).siblings().removeClass(navHightClass);
            var image_prop = copute_image_prop(imgArr[imgIndex]);
            previewImg(image_prop);
        } else {
            var max_num = imgNum - g.navItemNum;
            moveIndex++;
            if (moveIndex >= max_num) {
                moveIndex = max_num;
            }
            if (imgIndex <= moveIndex) {
                imgIndex = moveIndex;
            }
            navEleMove();
        }
    }

    /**
     * 导航向左
     */
    function moveLeft() {
        if (imgNum <= g.navItemNum) {
            imgIndex--;
            if (imgIndex <= 0) {
                imgIndex = 0;
            }
            navEleSpan.eq(imgIndex).addClass(navHightClass).siblings().removeClass(navHightClass);
            previewImg(imgArr[imgIndex]);
        } else {
            moveIndex--;
            if (moveIndex <= 0) {
                moveIndex = 0;
            }
            if (imgIndex >= moveIndex + g.navItemNum) {
                imgIndex = moveIndex + g.navItemNum - 1;
            }
            navEleMove();
        }
    }

    /**
     * 移动导航图片
     */
    function navEleMove() {
        navEleInner.css({left: -moveIndex * (navHeightWithBorder + g.navItemMargin) + "px"});
        navEleSpan.eq(imgIndex).addClass(navHightClass).siblings().removeClass(navHightClass);
        previewImg(imgArr[imgIndex]);
    }


    /**
     * 自动播放
     */
    function autoPlay() {
        if (g.autoPlay) {
            autoPlayInterval = window.setInterval(function () {
                if (autoPlayNavIndex >= navEleSpan.length) {
                    autoPlayNavIndex = 0;
                }
                focusNavImg(autoPlayNavIndex);
                autoPlayNavIndex++
            }, g.autoPlayTimeout);
        }
    }

    /**
     * 预览图片
     */
    function previewImg(image_prop) {
        previewBoxImg.attr("src", image_prop[0]);
        mainImg.attr("src", image_prop[0])
            .css({
                "width": image_prop[3] + "px",
                "height": image_prop[4] + "px"
            });
        mainImgOuter.css({
            "width": image_prop[3] + "px",
            "height": image_prop[4] + "px",
            "top": image_prop[5] + "px",
            "left": image_prop[6] + "px",
            "position": "relative"
        });
        zoomZone.css({
            "width": image_prop[7] + "px",
            "height": image_prop[7] + "px"
        });
        previewBoxImg.css({
            "width": image_prop[8] + "px",
            "height": image_prop[9] + "px"
        });
    }

    /**
     * 获得图片的真实尺寸
     * @param url
     * @param callback
     */
    function getImageWidth(url, callback) {
        var img = new Image();
        img.src = url;

        // 如果图片被缓存，则直接返回缓存数据
        if (img.complete) {
            callback(img.width, img.height);
        } else {
            // 完全加载完毕的事件
            img.onload = function () {
                callback(img.width, img.height);
            }
        }
    }

    /**
     * 计算图片属性
     * @param image : jquery 对象或 图片url地址
     * @param width : image 为图片url地址时指定宽度
     * @param height : image 为图片url地址时指定高度
     * @returns {Array}
     */
    function copute_image_prop(image, width, height) {
        var src;
        var res = [];

        if (typeof image == "string") {
            src = image;
        } else {
            src = image.attr("src");
            width = image.width();
            height = image.height();
        }

        res[0] = src;
        res[1] = width;
        res[2] = height;
        var img_scale = res[1] / res[2];

        if (img_scale === 1) {
            res[3] = boxHeight;//width
            res[4] = boxHeight;//height
            res[5] = 0;//top
            res[6] = 0;//left
            res[7] = boxHeight / 2;
            res[8] = boxHeight * 2;//width
            res[9] = boxHeight * 2;//height
            navEleInner.append("<span><img src='" + src + "' width='" + g.navWidth +
                "' height='" + g.navHeight + "' /></span>");
        } else if (img_scale > 1) {
            res[3] = boxHeight;//width
            res[4] = boxHeight / img_scale;
            res[5] = (boxHeight - res[4]) / 2;
            res[6] = 0;//left
            res[7] = res[4] / 2;
            res[8] = boxHeight * 2 * img_scale;//width
            res[9] = boxHeight * 2;//height
            navEleInner.append("<span><img src='" + src + "' width='" + g.navWidth +
                "' style='top:" + (g.navHeight - (g.navWidth / img_scale)) / 2 + "px;' /></span>");
        } else if (img_scale < 1) {
            res[3] = boxHeight * img_scale;//width
            res[4] = boxHeight;//height
            res[5] = 0;//top
            res[6] = (boxHeight - res[3]) / 2;
            res[7] = res[3] / 2;
            res[8] = boxHeight * 2;//width
            res[9] = boxHeight * 2 / img_scale;
            navEleInner.append("<span><img src='" + src + "' height='" + g.navHeight +
                "' style='left:" + (g.navWidth - (g.navHeight * img_scale)) / 2 + "px;' /></span>");
        }

        return res;
    }

// 闭包结束     
})(jQuery, window);