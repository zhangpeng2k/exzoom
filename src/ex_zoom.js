;(function ($, window) {

    var defaults = {
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
    };

    var g = {};//全局变量

    $.fn.extend({
        "ex_zoom": function (options) {
            var opts = $.extend({}, defaults, options);

            g.box_ele = $(opts.box_ele);
            g.nav_ele = $(opts.nav_ele);
            g.nav_current_img_class = opts.nav_current_img_class;
            g.box_width = opts.box_width;
            g.box_height = opts.box_height;
            g.nav_width = opts.nav_width;
            g.nav_height = opts.nav_height;
            g.nav_border = opts.nav_border;
            g.nav_item_margin = opts.nav_item_margin;
            g.nav_item_num = opts.nav_item_num;
            g.images = g.box_ele.find("img");
            g.img_num = g.images.length;
            g.img_index = 0;
            g.img_arr = [];
            g.next_btn = $(opts.next_btn);//缩略图导航下一张按钮
            g.prev_btn = $(opts.prev_btn);//缩略图导航上一张按钮
            g.move_index = 0;//缩略图导航索引

            g.nav_ele.append("<p style='position:absolute;left:0;top:0;margin: 0'></p>");
            g.nav_ele_inner = g.nav_ele.find("p");

            for (var i = 0; i < g.img_num; i++) {
                g.img_arr[i] = [];//图片属性数组
                g.img_arr[i][0] = g.images.eq(i).attr("src");
                g.img_arr[i][1] = g.images.eq(i).width();
                g.img_arr[i][2] = g.images.eq(i).height();
                var img_scale = g.img_arr[i][1] / g.img_arr[i][2];
                if (img_scale === 1) {
                    g.img_arr[i][3] = g.box_width;//width
                    g.img_arr[i][4] = g.box_height;//height
                    g.img_arr[i][5] = 0;//top
                    g.img_arr[i][6] = 0;//left
                    g.img_arr[i][7] = g.box_width / 2;
                    g.img_arr[i][8] = g.box_width * 2;//width
                    g.img_arr[i][9] = g.box_height * 2;//height
                    g.nav_ele_inner.append("<span><img src='" + g.images.eq(i).attr("src") + "' width='" + g.nav_width +
                        "' height='" + g.nav_height + "' /></span>");
                } else if (img_scale > 1) {
                    g.img_arr[i][3] = g.box_width;//width
                    g.img_arr[i][4] = g.box_width / img_scale;
                    g.img_arr[i][5] = (g.box_height - g.img_arr[i][4]) / 2;
                    g.img_arr[i][6] = 0;//left
                    g.img_arr[i][7] = g.img_arr[i][4] / 2;
                    g.img_arr[i][8] = g.box_height * 2 * img_scale;//width
                    g.img_arr[i][9] = g.box_height * 2;//height
                    g.nav_ele_inner.append("<span><img src='" + g.images.eq(i).attr("src") + "' width='" + g.nav_width +
                        "' style='top:" + (g.nav_height - (g.nav_width / img_scale)) / 2 + "px;' /></span>");
                } else if (img_scale < 1) {
                    g.img_arr[i][3] = g.box_height * img_scale;//width
                    g.img_arr[i][4] = g.box_height;//height
                    g.img_arr[i][5] = 0;//top
                    g.img_arr[i][6] = (g.box_width - g.img_arr[i][3]) / 2;
                    g.img_arr[i][7] = g.img_arr[i][3] / 2;
                    g.img_arr[i][8] = g.box_width * 2;//width
                    g.img_arr[i][9] = g.box_width * 2 / img_scale;
                    g.nav_ele_inner.append("<span><img src='" + g.images.eq(i).attr("src") + "' height='" + g.nav_height +
                        "' style='left:" + (g.nav_width - (g.nav_height * img_scale)) / 2 + "px;' /></span>");
                }
            }
            g.images.remove();

            // nav_ele.append("<div style='clear:both;width:100%;'></div>");
            g.nav_ele_span = g.nav_ele.find("span");
            g.nav_height_with_border = g.nav_border * 2 + g.nav_height;
            g.nav_ele_width = (g.nav_height_with_border + g.nav_item_margin) * g.nav_item_num;
            g.nav_ele_inner_width = (g.nav_height_with_border + g.nav_item_margin) * g.img_num;

            g.nav_ele_span.eq(g.img_index).addClass(g.nav_current_img_class);
            g.nav_ele.css({
                "height": g.nav_height_with_border + "px",
                "width": g.nav_ele_width + "px",
            });
            g.nav_ele_inner.css({
                "width": g.nav_ele_inner_width + "px"
            });
            g.nav_ele_span.css({
                "margin-left": g.nav_item_margin + "px",
                "width": g.nav_width + "px",
                "height": g.nav_height + "px",
            });

            //大图和预览区域部分
            g.box_ele.append("<div style='position:relative;'><b style='display:block;'>" +
                "<img style='display:block;' src='' class='ex_zoom_main_img'/></b>" +
                "<span style='position:absolute;left:0;top:0;display:none;z-index:5;'></span>" +
                "</div><p style='position:absolute;overflow:hidden;top:0;display:none;'>" +
                "<img style='max-width:none;max-height:none;position:relative;left:0;top:0;' src='' /></p>");

            g.zoom_zone = g.box_ele.find("span");
            g.box_ele_img = g.box_ele.find("b img");
            g.box_ele_img_outer = g.box_ele.find("div");
            g.preview_box = g.box_ele.find("p");
            g.preview_box_img = g.box_ele.find("p img");

            g.box_ele.css({
                "width": g.box_width + "px",
                "height": g.box_height + "px",
                "position": "relative"
            });

            g.preview_box.css({
                "width": g.box_width + "px",
                "height": g.box_height + "px",
                "left": g.box_width + 10 + "px"
            });

            preview_img();

            //在大图区域移动
            g.box_ele_img_outer.on("mousemove", function (e) {
                var width_limit = g.zoom_zone.width() / 2,
                    max_X = g.box_ele_img_outer.width() - width_limit,
                    max_Y = g.box_ele_img_outer.height() - width_limit,
                    current_X = e.pageX - g.box_ele_img_outer.offset().left,
                    current_Y = e.pageY - g.box_ele_img_outer.offset().top,
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
                g.zoom_zone.css({"left": move_X + "px", "top": move_Y + "px"});

                g.preview_box_img.css({
                    "left": -move_X * g.preview_box.width() / g.zoom_zone.width() + "px",
                    "top": -move_Y * g.preview_box.width() / g.zoom_zone.width() + "px"
                });
            });

            //进入进入大图区域
            g.box_ele_img_outer.on("mouseenter", function () {
                g.zoom_zone.css("display", "block");
                g.preview_box.css("display", "block");
            });

            //离开大图区域
            g.box_ele_img_outer.on("mouseleave", function () {
                g.zoom_zone.css("display", "none");
                g.preview_box.css("display", "none");
            });

            //缩略图导航
            if (g.img_num <= g.nav_item_num) {
                g.nav_ele_inner.css("left", (g.nav_item_num - g.img_num) * g.nav_height_with_border / 2 + "px");
            }
            g.next_btn.on("click", function () {
                move_right();
            });
            g.prev_btn.on("click", function () {
                move_left();
            });

            g.nav_ele_span.hover(function () {
                g.img_index = $(this).index();
                g.nav_ele_span.eq(g.img_index).addClass(g.nav_current_img_class).siblings().removeClass(g.nav_current_img_class);
                preview_img();
            });
        },
    })


    /**
     * 导航向右
     */
    function move_right() {
        if (g.img_num <= g.nav_item_num) {
            g.img_index++;
            if (g.img_index >= g.img_num) {
                g.img_index = g.img_num - 1;
            }
            g.nav_ele_span.eq(g.img_index).addClass(g.nav_current_img_class).siblings().removeClass(g.nav_current_img_class);
            preview_img();
        } else {
            var max_num = g.img_num - g.nav_item_num;
            g.move_index++;
            if (g.move_index >= max_num) {
                g.move_index = max_num;
            }
            if (g.img_index <= g.move_index) {
                g.img_index = g.move_index;
            }
            nav_ele_move();
        }
    }

    /**
     * 导航向左
     */
    function move_left() {
        if (g.img_num <= g.nav_item_num) {
            g.img_index--;
            if (g.img_index <= 0) {
                g.img_index = 0;
            }
            g.nav_ele_span.eq(g.img_index).addClass(g.nav_current_img_class).siblings().removeClass(g.nav_current_img_class);
            preview_img();
        } else {
            g.move_index--;
            if (g.move_index <= 0) {
                g.move_index = 0;
            }
            if (g.img_index >= g.move_index + g.nav_item_num) {
                g.img_index = g.move_index + g.nav_item_num - 1;
            }
            nav_ele_move();
        }
    }

    /**
     * 移动导航图片
     */
    function nav_ele_move() {
        g.nav_ele_inner.css({left: -g.move_index * (g.nav_height_with_border + g.nav_item_margin) + "px"});
        g.nav_ele_span.eq(g.img_index).addClass(g.nav_current_img_class).siblings().removeClass(g.nav_current_img_class);
        preview_img();
    }

    /**
     * 预览图片
     */
    function preview_img() {
        g.preview_box_img.attr("src", g.img_arr[g.img_index][0]);
        g.box_ele_img.attr("src", g.img_arr[g.img_index][0]);
        g.box_ele_img.css({
            "width": g.img_arr[g.img_index][3] + "px",
            "height": g.img_arr[g.img_index][4] + "px"
        });
        g.box_ele_img_outer.css({
            "width": g.img_arr[g.img_index][3] + "px",
            "height": g.img_arr[g.img_index][4] + "px",
            "top": g.img_arr[g.img_index][5] + "px",
            "left": g.img_arr[g.img_index][6] + "px",
            "position": "relative"
        });
        g.zoom_zone.css({
            "width": g.img_arr[g.img_index][7] + "px",
            "height": g.img_arr[g.img_index][7] + "px"
        });
        g.preview_box_img.css({
            "width": g.img_arr[g.img_index][8] + "px",
            "height": g.img_arr[g.img_index][9] + "px"
        });
    }


// 闭包结束     
})(jQuery, window);