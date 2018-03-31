;(function ($) {
    $.fn.ex_zoom = function (options) {
        var opts = $.extend({},
            $.fn.ex_zoom.defaults, options);

        var box_ele = $(opts.box_ele),
            nav_ele = $(opts.nav_ele),
            nav_current_img_class = opts.nav_current_img_class,
            box_width = opts.box_width,
            box_height = opts.box_height,
            nav_width = opts.nav_width,
            nav_height = opts.nav_height,
            nav_border = opts.nav_border,
            nav_item_margin = opts.nav_item_margin,
            nav_item_num = opts.nav_item_num,
            // _last, _next,
            images = box_ele.find("img"),
            img_num = images.length,

            img_index = 0,
            img_arr = [],
            next_btn = $(opts.next_btn),//缩略图导航下一张按钮
            prev_btn = $(opts.prev_btn),//缩略图导航上一张按钮
            move_index = 0;//缩略图导航索引

        nav_ele.append("<p style='position:absolute;left:0;top:0;margin: 0'></p>");
        var nav_ele_inner = nav_ele.find("p");

        for (var i = 0; i < img_num; i++) {
            img_arr[i] = [];//图片属性数组
            img_arr[i][0] = images.eq(i).attr("src");
            img_arr[i][1] = images.eq(i).attr("width");
            img_arr[i][2] = images.eq(i).attr("height");
            var img_scale = img_arr[i][1] / img_arr[i][2];
            if (img_scale === 1) {
                img_arr[i][3] = box_width;//width
                img_arr[i][4] = box_height;//height
                img_arr[i][5] = 0;//top
                img_arr[i][6] = 0;//left
                img_arr[i][7] = box_width / 2;
                img_arr[i][8] = box_width * 2;//width
                img_arr[i][9] = box_height * 2;//height
                nav_ele_inner.append("<span><img src='" + images.eq(i).attr("src") + "' width='" + nav_width +
                    "' height='" + nav_height + "' /></span>");
            } else if (img_scale > 1) {
                img_arr[i][3] = box_width;//width
                img_arr[i][4] = box_width / img_scale;
                img_arr[i][5] = (box_height - img_arr[i][4]) / 2;
                img_arr[i][6] = 0;//left
                img_arr[i][7] = img_arr[i][4] / 2;
                img_arr[i][8] = box_height * 2 * img_scale;//width
                img_arr[i][9] = box_height * 2;//height
                nav_ele_inner.append("<span><img src='" + images.eq(i).attr("src") + "' width='" + nav_width +
                    "' style='top:" + (nav_height - (nav_width / img_scale)) / 2 + "px;' /></span>");
            } else if (img_scale < 1) {
                img_arr[i][3] = box_height * img_scale;//width
                img_arr[i][4] = box_height;//height
                img_arr[i][5] = 0;//top
                img_arr[i][6] = (box_width - img_arr[i][3]) / 2;
                img_arr[i][7] = img_arr[i][3] / 2;
                img_arr[i][8] = box_width * 2;//width
                img_arr[i][9] = box_width * 2 / img_scale;
                nav_ele_inner.append("<span><img src='" + images.eq(i).attr("src") + "' height='" + nav_height +
                    "' style='left:" + (nav_width - (nav_height * img_scale)) / 2 + "px;' /></span>");
            }
        }
        images.css("display", "none").addClass("ex_zoom_hidden_img");
        // images.remove();

        nav_ele.append("<div style='clear:both;width:100%;'></div>");
        var nav_ele_span = nav_ele.find("span");
        var nav_ele_img = nav_ele.find("img");
        var _border = nav_border * 2 + nav_height;
        var nav_ele_width = (_border + nav_item_margin) * nav_item_num;
        var nav_ele_inner_width = (_border + nav_item_margin) * img_num;

        nav_ele_span.eq(img_index).addClass(nav_current_img_class);
        nav_ele.css({
            "overflow": "hidden",
            "height": _border + "px",
            "width": nav_ele_width + "px",
            "position": "relative",
        });
        nav_ele_inner.css({
            "width": nav_ele_inner_width + "px"
        });
        nav_ele_span.css({
            "float": "left",
            "margin-left": nav_item_margin + "px",
            "width": nav_width + "px",
            "height": nav_height + "px",
            "overflow": "hidden",
            "position": "relative"
        });
        nav_ele_img.css({
            "max-width": "100%",
            "max-height": "100%",
            "position": "relative"
        });

        //大图和预览区域部分
        box_ele.append("<div style='position:relative;'><b style='display:block;'>" +
            "<img style='display:block;' src='' /></b>" +
            "<span style='position:absolute;left:0;top:0;display:none;z-index:5;'></span>" +
            "</div><p style='position:absolute;overflow:hidden;top:0;display:none;'>" +
            "<img style='max-width:none;max-height:none;position:relative;left:0;top:0;' src='' /></p>");

        var zoom_zone = box_ele.find("span");
        var box_ele_img = box_ele.find("b img");
        var box_ele_img_outter = box_ele.find("div");
        var preview_box = box_ele.find("p");
        var preview_box_img = box_ele.find("p img");

        box_ele.css({
            "width": box_width + "px",
            "height": box_height + "px",
            "position": "relative"
        });

        preview_box.css({
            "width": box_width + "px",
            "height": box_height + "px",
            "left": box_width + 10 + "px"
        });

        preview_img();

        //在大图区域移动
        box_ele_img_outter.on("mousemove", function (e) {
            var width_limit = zoom_zone.width() / 2,
                max_X = box_ele_img_outter.width() - width_limit,
                max_Y = box_ele_img_outter.height() - width_limit,
                current_X = e.pageX - box_ele_img_outter.offset().left,
                current_Y = e.pageY - box_ele_img_outter.offset().top,
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
            zoom_zone.css({"left": move_X + "px", "top": move_Y + "px"});

            preview_box_img.css({
                "left": -move_X * preview_box.width() / zoom_zone.width() + "px",
                "top": -move_Y * preview_box.width() / zoom_zone.width() + "px"
            });
        });

        //进入进入大图区域
        box_ele_img_outter.on("mouseenter", function () {
            zoom_zone.css("display", "block");
            preview_box.css("display", "block");
        });

        //离开大图区域
        box_ele_img_outter.on("mouseleave", function () {
            zoom_zone.css("display", "none");
            preview_box.css("display", "none");
        });

        //缩略图导航
        if (img_num <= nav_item_num) {
            nav_ele_inner.css("left", (nav_item_num - img_num) * _border / 2 + "px");
        }
        next_btn.on("click", function () {
            move_right();
        });
        prev_btn.on("click", function () {
            move_left();
        });

        nav_ele_span.hover(function () {
            img_index = $(this).index();
            nav_ele_span.eq(img_index).addClass(nav_current_img_class).siblings().removeClass(nav_current_img_class);
            preview_img();
        });

        function move_right() {
            if (img_num <= nav_item_num) {
                img_index++;
                if (img_index >= img_num) {
                    img_index = img_num - 1;
                }
                nav_ele_span.eq(img_index).addClass(nav_current_img_class).siblings().removeClass(nav_current_img_class);
                preview_img();
            } else {
                move_index++;
                var max_num = img_num - nav_item_num;
                if (move_index >= max_num) {
                    move_index = max_num;
                }
                if (img_index <= move_index) {
                    img_index = move_index;
                }
                nav_ele_move();
            }
        }

        function move_left() {
            if (img_num <= nav_item_num) {
                img_index--;
                if (img_index <= 0) {
                    img_index = 0;
                }
                nav_ele_span.eq(img_index).addClass(nav_current_img_class).siblings().removeClass(nav_current_img_class);
                preview_img();
            } else {
                move_index--;
                if (move_index <= 0) {
                    move_index = 0;
                }
                if (img_index >= move_index + nav_item_num) {
                    img_index = move_index + nav_item_num - 1;
                }
                nav_ele_move();
            }

        }

        function preview_img() {
            preview_box_img.attr("src", img_arr[img_index][0]);
            box_ele_img.attr("src", img_arr[img_index][0]);
            box_ele_img.css({
                "width": img_arr[img_index][3] + "px",
                "height": img_arr[img_index][4] + "px"
            });
            box_ele_img_outter.css({
                "width": img_arr[img_index][3] + "px",
                "height": img_arr[img_index][4] + "px",
                "top": img_arr[img_index][5] + "px",
                "left": img_arr[img_index][6] + "px",
                "position": "relative"
            });
            zoom_zone.css({
                "width": img_arr[img_index][7] + "px",
                "height": img_arr[img_index][7] + "px"
            });
            preview_box_img.css({
                "width": img_arr[img_index][8] + "px",
                "height": img_arr[img_index][9] + "px"
            });
        }


        function nav_ele_move() {
            nav_ele_inner.css({left: -move_index * (_border + nav_item_margin) + "px"});
            nav_ele_span.eq(img_index).addClass(nav_current_img_class).siblings().removeClass(nav_current_img_class);
            preview_img();
        }

        return this;
    };

    // 插件的defaults
    $.fn.ex_zoom.defaults = {
        "box_ele": "#ex_zoom .ex_zoom_img_box",
        "nav_ele": "#ex_zoom .ex_zoom_nav",
        "box_width": 400,//宽度,该版本中请把宽高填写成一样
        "box_height": 400,//高度,该版本中请把宽高填写成一样
        "nav_width": 60,//列表每个宽度,该版本中请把宽高填写成一样
        "nav_height": 60,//列表每个高度,该版本中请把宽高填写成一样
        "nav_item_margin": 7,//列表间隔
        "nav_item_num": 5,//列表显示个数
        "nav_current_img_class": "current",//当前图片,
        "nav_border": 1,//列表边框，没有边框填写0，边框在css中修改
        "prev_btn": "#ex_zoom_prev_btn",//导航上一张图片
        "next_btn": "#ex_zoom_next_btn",//导航下一张图片
    }
    ;
// 闭包结束     
})(jQuery); 