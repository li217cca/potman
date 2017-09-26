/**
 * Created by cifer on 2017/9/17.
 */
!
    function () {
        var e, t = document.createElement("script"),
            o = "http://ckx000.github.io/GBF/",
            i = o + "casino_poker.js?",
            n = o + "casino_slot.js?",
            s = o + "casino_bingo.js?",
            d = o + "bf.js?",
            a = o + "battle.js?",
            c = 'function mp(){var s=document.createElement(\'script\');s.onerror=function(){$(\'<div class="wgerror" style="position:absolute;z-index:250001;top:0;right:0"><button style="width:110px">内核加载失败,请重试(刷新</button></div>\').appendTo(document.body);setTimeout("$(\'.wgerror\').remove()",3000)};s.src=\'',
            r = "';document.body.appendChild(s)};function sc(){$('.wgload').remove()};function sb(){if(window.$ && !$('#ready').is(':visible')){wglding=setTimeout(mp,3000);setTimeout(sc,3000);$('<div class=\"wgload\" style=\"position:absolute;z-index:250001;top:12px;left:0;width:200px;\"><button>脚本启动中,3秒内点击按钮取消</button></div>').appendTo(document.body).on('ontouchstart' in window ? 'touchstart' : 'mousedown',function(){clearTimeout(wglding)});}else{setTimeout(function(){sb()},1000)}}sb()",
            l = "';document.body.appendChild(s)};mp()",
            u = $("#ready"),
            b = $("#loading"),
            p = function () {
                return u ? u.is(":hidden") : (u = $("#ready"), !1)
            },
            m = function () {
                return b ? b.is(":hidden") : (b = $("#loading"), !1)
            },
            h = function () {
                if (m() && p()) if (/casino\/game\/poker/i.test(location.hash)) {
                    var o = c + i + (new Date).getTime() + r;
                    t.innerHTML = o,
                        document.body.appendChild(t)
                } else if (/casino\/game\/slot/i.test(location.hash)) {
                    var o = c + n + (new Date).getTime() + r;
                    t.innerHTML = o,
                        document.body.appendChild(t)
                } else if (/casino\/game\/bingo/i.test(location.hash)) {
                    var o = c + s + (new Date).getTime() + r;
                    t.innerHTML = o,
                        document.body.appendChild(t)
                } else if (/quest\/assist/i.test(location.hash)) {
                    var o = c + d + (new Date).getTime() + l;
                    t.innerHTML = o,
                        document.body.appendChild(t)
                } else if ($("#loading,#ready").is(":hidden") && (/#raid_/i.test(location.hash) || /#raid\//i.test(location.hash))) {
                    var o = c + a + (new Date).getTime() + l;
                    t.innerHTML = o,
                        document.body.appendChild(t)
                } else e = setTimeout(h, 2e3);
                else e = setTimeout(h, 1e3)
            };
        "gbf.game.mbga.jp" == location.host && $("<style>body{overflow-x:hidden;}body::-webkit-scrollbar{width:1px;background:#ccc;opacity:.3}body::-webkit-scrollbar-piece{background:#eee}body::-webkit-scrollbar-thumb{background:#666}[class*=btn-]{cursor:pointer}</style>").appendTo(document.head),
            $(document).ready(h)
    }();