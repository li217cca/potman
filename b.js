/**
 * Created by cifer on 2017/9/17.
 */
var t, e = !0x1,
    n = "ontouchstart" in window ? "touchstart" : "mousedown",
    o = {
        ver: 0x1,
        pf: 0x0,
        st1: null,
        st2: null
    },
    a = "\n",
s = ["color:#000000", "color:#307730", "color:#AAAAAA", "color:white; background-color:#77A8F3", "color:white; background-color:#0055CC", "color:white; background-color:#B03939"],
    d = function (t, e) {
        return dt.sfzkztscxx ? void console.info("%c" + t, s[e]) : void(d = function () {})
    },
    get_rect = function (handle) {
        handle instanceof jQuery || (handle = $(handle));// handle 是否存在JQ属性，否则再次选择
        // class
        var e, zoom = $(document.documentElement).css("zoom"),
            o = {
                x: 0x0,
                y: 0x0,
                w: 0x0,
                h: 0x0
            },
            parent = handle.parents();
        if (o.w = handle.innerWidth() * zoom,
                o.h = handle.innerHeight() * zoom,
            (0x0 == o.w || 0x0 == o.h) && ( // 判断 w, h 是非为0
                handle = handle.parent(),  // 取其父节点 w, h 值
                    o.w = handle.innerWidth() * zoom, o.h = handle.innerHeight() * zoom),
                parent.is(document.body))
            for (var node = handle; node[0x0] != document.body; node = node.parent()) // 遍历父节点
                e = node.position(),
                o.y = o.y + e.top * zoom,
                o.x = o.x + e.left * zoom;
        return o
    },
    press = function (className) { // click事件
        console.log = console.info
        className = className+":last"
        console.info("press", className)
        var rect = get_rect(className);
        console.info("rect", rect)
        if (!(rect.y < 0x1 || rect.x < 0x1)) {
            var x = Math.round(rect.x + Math.random() * rect.w),
                y = Math.round(rect.y + Math.random() * rect.h),
                mouseup = new MouseEvent("mouseup", {
                    view: window,
                    bubbles: !0x0,
                    clientX: x,
                    clientY: y,
                    cancelable: !0x0
                }),
                mousedown = new MouseEvent("mousedown", {
                    view: window,
                    bubbles: !0x0,
                    clientX: x,
                    clientY: y,
                    cancelable: !0x0
                }),
                handle = $(className);
            console.info("to press", x, y)
            console.info("handle", handle)
            0x0 != handle.length && (handle[0x0].dispatchEvent(mousedown), handle[0x0].dispatchEvent(mouseup))
        } else {
            console.info(rect.y, rect.x)
        }
    },
    u = function (t) {
        var e = $("div", t),
            n = e.size() - 0x1,
            o = 0x0;
        return e.each(function (t, e) {
            o += ~~e.className.split("_")[0x1] * Math.pow(0xa, n - t)
        }),
            o
    },
    c = function (t) {
        $("#canv").trigger(t)
    },
    p = function (t) {
        exportRoot["card_" + t + "_select"] = 0x1
    },
    m = function (t) {
        return Math.round(1e4 * t) / 0x64 + "%"
    },
    l = function (t) {
        return $(t).is(":visible")
    },
    b = function (t) {
        return $(".prt-navigation").text() == t
    },
    f = function () {
        var t = [],
            e = 0x0,
            n = ["脚本启动时间", "最后一次操作", "每局筹码", "双倍最高回数", "累计牌桌游戏次数", "累计双倍游戏次数", "累计双倍赌对次数", "累计双倍赌错次数", "薛定谔猜对次数", "薛定谔猜错次数", "初始游戏筹码"],
            o = R.medal();
        for (var s in g) t.push(n[e] + ": " + g[s]),
            e++;
        t.push("现在游戏筹码: " + o),
            t.push("累计筹码收益: " + (o - g.csyxcm)),
            console.info(t.join("" + a))
    },
    h = function (t, e) {
        "" != y.gchoice && ("大" == y.gchoice && R.doub(0x1).point < R.doub(0x2).point || "大" != y.gchoice && R.doub(0x1).point > R.doub(0x2).point ? (g.xdecdcs++, d(t)) : (g.xdecccs++, d(e)), y.gchoice = "")
    },
    y = {
        running: !0x1,
        timeout: 0x0,
        deck: 0x0,
        doubleup: 0x0,
        doubletimes: 0x0,
        lastchoice: "",
        gchoice: ""
    },
    g = {
        jbqdsj: (new Date).toLocaleString(),
        zhyccz: "未操作",
        mjcm: 0x0,
        sbzghs: 0x0,
        ljpzyxcs: 0x0,
        ljsbyxcs: 0x0,
        ljsbddcs: 0x0,
        ljsbdccs: 0x0,
        xdecdcs: 0x0,
        xdecccs: 0x0,
        csyxcm: 0x0
    },
    j = function () {
        console.debug(y)
    },
    x = function () {
        return C.canstart() ? [0x0, 0x0] : C.canok() ? [0x1, 0x0] : C.candoubleup() ? [0x2, 0x0] : C.canhighlow() ? [0x3, 0x0] : C.canyesno() ? [0x3, 0x1] : void 0x0
    },
    z = function () {
        var t = x();
        t ? (y.deck = t[0x0], y.doubleup = t[0x1]) : d("Oh my god!你可能不在打牌界面。", 0x2)
    },
    v = function () {
        g.zhyccz = (new Date).toLocaleString()
    },
    w = {},
    k = function () {
        for (var t = 0x2; 0xe >= t; t++) w[t] = {
            mIN: (t - 0x2) / 0xc,
            mAX: 0x1 - (t - 0x2) / 0xc
        }
    },
    D = {
        gqsj: 0x0,
        numData: {}
    },
    A = {
        gqsj: 0x0,
        numData: []
    },
    O = function () {
        var t = {},
            e = ["总", "大", "小", "平"],
            n = {};
        for (var o in D.numData) {
            var a = D.numData[o],
                s = 0x0,
                d = G(o),
                i = {};
            for (var r in a) i[e[s]] = a[r],
                s++;
            i["可信度"] = m(d.cred),
                i["大概率"] = m(d.mAX),
                i["大基准"] = m(w[o].mAX),
                i["小概率"] = m(d.mIN),
                i["小基准"] = m(w[o].mIN),
                t[o] = i
        };
        for (var u = 0x0; u < A.numData.length; u++) n[u] = {
            "\u51fa\u5c0f\u6b21\u6570": A.numData[u][0x0],
            "\u51fa\u5927\u6b21\u6570": A.numData[u][0x1],
            "\u6b63\u786e\u6b21\u6570": A.numData[u][0x2],
            "\u9519\u8bef\u6b21\u6570": A.numData[u][0x3]
        };
        return console.info("双卡模式:"),
            console.table(t),
            console.info("无限模式:"),
            console.table(n),
        "样本过期时间: " + new Date(D.gqsj).toLocaleString()
    },
    _ = function (t) {
        D.numData[t] = {
            tOTAL: 0x0,
            mAX: 0x0,
            mIN: 0x0,
            dRAW: 0x0
        }
    },
    T = function () {
        var t = localStorage.wg_casino_poker_samples;
        t && (D = JSON.parse(t))
    },
    H = function () {
        var t = localStorage.wg_casino_poker_samples2;
        t && (A = JSON.parse(t))
    },
    N = function () {
        localStorage.wg_casino_poker_samples = JSON.stringify(D)
    },
    I = function () {
        localStorage.wg_casino_poker_samples2 = JSON.stringify(A)
    },
    S = function () {
        var t = localStorage.wg_casino_poker_config;
        return t && (t = JSON.parse(t), t.ver == o.ver) ? void(o = t) : void M()
    },
    M = function () {
        localStorage.wg_casino_poker_config = JSON.stringify(o)
    },
    X = function () {
        if ((new Date).getTime() > D.gqsj) {
            var t = new Date;
            t.getHours() >= dt.sjdybzmtjdsgq && (t = new Date(t.getTime() + 864e5)),
                t.setHours(dt.sjdybzmtjdsgq),
                t.setMinutes(0x0),
                t.setSeconds(0x0),
                t.setMilliseconds(0x0),
                D = {
                    gqsj: t.getTime(),
                    numData: {}
                }
        }
    },
    L = function () {
        if ((new Date).getTime() > A.gqsj) {
            var t = new Date;
            t.getHours() >= dt.sjdybzmtjdsgq && (t = new Date(t.getTime() + 864e5)),
                t.setHours(dt.sjdybzmtjdsgq),
                t.setMinutes(0x0),
                t.setSeconds(0x0),
                t.setMilliseconds(0x0),
                A = {
                    gqsj: t.getTime(),
                    numData: []
                }
        }
    },
    q = function () {
        if (!C.issinglecard()) {
            X();
            var t = R.doub(0x1).point,
                e = R.doub(0x2).point;
            t in D.numData || _(t),
                D.numData[t].tOTAL++,
                e > t ? D.numData[t].mAX++ : t > e ? D.numData[t].mIN++ : D.numData[t].dRAW++,
                N()
        }
    },
    W = function (t) {
        if (C.issinglecard()) {
            L();
            var e = R.doub(0x1).point,
                n = y.doubletimes;
            if (A.numData[n] || (A.numData[n] = [0x0, 0x0, 0x0, 0x0]), A.numData[n][t + 0x1]++, 0x63 == e || 0xe == e) return void I();
            e >= 0x8 ? A.numData[n][0x1]++ : A.numData[n][0x0]++,
                I()
        }
    },
    G = function (t) {
        var e = D.numData[t];
        return e.tOTAL - e.dRAW == 0x0 ? null : (e = e.mIN / (e.tOTAL - e.dRAW), {
            mIN: e,
            mAX: 0x1 - e,
            cred: Math.min(0x1, D.numData[t].tOTAL / dt.ybkxdfm)
        })
    },
    J = function (t, e) {
        var n = t.split("_");
        this.cOlOr = ~~n[0x0],
            this.point = ~~n[0x1],
        0x1 == this.point && (this.point = 0xe),
            this.loc = e + 0x1
    },
    E = {
        conv: function (t) {
            return t.map(function (t, e) {
                return new J(t, e)
            })
        },
        sort: function (t, e) {
            for (var n = 0x0, o = t.length; o > n; n++) for (var a = n + 0x1; o > a; a++) if (t[n][e] > t[a][e]) {
                var s = t[a];
                t[a] = t[n],
                    t[n] = s
            }
        }
    },
    R = {
        deck: function () {
            return E.conv(cards_1_Array)
        },
        doub: function (t) {
            return new J(window["doubleUp_card_" + t], 0x0)
        },
        bet: function () {
            return u(".prt-bet")
        },
        medal: function () {
            return u(".prt-medal")
        }
    },
    C = {
        err: function () {
            return l(".txt-title:contains(エラー)")
        },
        captcha: function () {
            return l(".prt-popup-header:contains(画像認証)")
        },
        canstart: function () {
            return l(".prt-start")
        },
        canok: function () {
            return l(".prt-ok")
        },
        canyesno: function () {
            return l(".prt-yes")
        },
        canhighlow: function () {
            return l(".prt-double-select")
        },
        candoubleup: function () {
            return b("ダブルアップに挑戦しますか？")
        },
        issinglecard: function () {
            return !("1" != Game.view.doubleKind)
        }
    },
    F = {
        tapstart: function () {
            d("点击START", 0x1),
                v(),
                press(".prt-start-shine")
        },
        tapok: function () {
            d("点击OK", 0x1),
                v(),
                press(".prt-ok-shine")
        },
        tapyes: function () {
            d("点击YES", 0x1),
                v(),
                press(".prt-yes-shine")
        },
        tapno: function () {
            d("点击NO", 0x1),
                v(),
                press(".prt-no-shine")
        },
        taphigh: function () {
            d("点击HIGH", 0x1),
                v(),
                press(".prt-high-shine")
        },
        taplow: function () {
            d("点击LOW", 0x1),
                v(),
                press(".prt-low-shine")
        },
        keep1pos: function () {
            d("保持第1张卡", 0x1),
                c("set1"),
                p(0x1)
        },
        keep2pos: function () {
            d("保持第2张卡", 0x1),
                c("set2"),
                p(0x2)
        },
        keep3pos: function () {
            d("保持第3张卡", 0x1),
                c("set3"),
                p(0x3)
        },
        keep4pos: function () {
            d("保持第4张卡", 0x1),
                c("set4"),
                p(0x4)
        },
        keep5pos: function () {
            d("保持第5张卡", 0x1),
                c("set5"),
                p(0x5)
        }
    },
    K = {
        keep: function () {
            var t = R.deck();
            E.sort(t, "point");
            for (var e = {}, n = !0x1, o = 0x0, a = 0x1 / 0x0, s = [], i = {}, r = 0x0, u = t.length; u > r; r++) t[r].cOlOr in i ? i[t[r].cOlOr].push(t[r].loc) : 0x63 == t[r].cOlOr ? (n = !0x0, e[t[r].loc] = !0x0) : i[t[r].cOlOr] = [t[r].loc],
            t[r + 0x1] && t[r].point == t[r + 0x1].point && (e[t[r].loc] = !0x0, e[t[r + 0x1].loc] = !0x0, o++),
            0x63 != t[r].point && (t[r].point < a && (a = t[r].point), s[t[r].point] = t[r].loc);
            if (0x0 == o) {
                var c = 0x0,
                    p = 0x0,
                    m = 0x1,
                    l = 0x0,
                    b = 0x0,
                    f = 0x0;
                for (var h in i) i[h].length > c && (c = i[h].length, p = h);
                n && (c++, m++),
                    s = s.slice(a);
                for (var r = 0x0, u = s.length; u > r; r++) if (void 0x0 != s[r]) {
                    for (var y = 0x0, g = 0x0, j = r; u > j && !(g >= 0x5) && (g++, !(void 0x0 == s[j] && (y++, y > m))); j++);
                    g - y > f && (f = g - y, l = r, b = g + r)
                };
                if (n && f++, d("顺子" + f + "枚,同花" + c + "枚", 0x2), 0x5 == f || 0x5 == c) e = {
                    0x1: !0x0,
                    0x2: !0x0,
                    0x3: !0x0,
                    0x4: !0x0,
                    0x5: !0x0
                };
                else if (c >= f) for (var r = 0x0, u = i[p].length; u > r; r++) e[i[p][r]] = !0x0;
                else for (var r = l; b > r; r++) void 0x0 != s[r] && (e[s[r]] = !0x0)
            };
            return e
        },
        hol: function () {
            if (C.issinglecard()) return A[y.doubletimes] && A.numData[y.doubletimes][0x0] != A.numData[y.doubletimes][0x1] ? (d("过去的样本中,第" + y.doubletimes + "次出现小的次数为" + A.numData[y.doubletimes][0x0] + ",出现大的次数为" + A.numData[y.doubletimes][0x1], 0x2), A.numData[y.doubletimes][0x0] < A.numData[y.doubletimes][0x1] ? "HIGH" : "LOW") : (d("过去没有样本,或样本中的大小概率一致,无参考价值", 0x2), Math.random() > .5 ? "HIGH" : "LOW");
            var t = R.doub(0x1);
            if (d("キター!你的对手是:" + t, 0x4), t.point in D.numData || _(t.point), dt.xdepnw) {
                var e = G(t.point),
                    n = w[t.point];
                if (e && D.numData[t.point].tOTAL >= dt.mode[o.pf].ybsjjchkssy) if (d("样本可信度" + m(e.cred), 0x2), d("出大概率" + m(e.mAX) + ", 基准" + m(n.mAX), 0x2), d("出小概率" + m(e.mIN) + ", 基准" + m(n.mIN), 0x2), e.mAX == n.mAX) {
                    var a = e.mAX > e.mIN ? "大" : "小";
                    y.gchoice = a,
                        d("完全的一致！薛定谔默默地选择了" + a)
                } else {
                    var s = e.mAX * e.cred + n.mAX * (0x1 - e.cred);
                    if (Math.abs(s - n.mAX) >= .02 + .016 * Math.abs(t.point - dt.dsbdgdfsds)) {
                        var a = e.mAX > e.mIN ? "小" : "大";
                        y.gchoice = a,
                            d("选择" + a + "！薛定谔毫不犹豫地作出了选择。")
                    } else {
                        var a = e.mAX > e.mIN ? "大" : "小";
                        y.gchoice = a,
                            d("太难以决择了...薛定谔犹豫了一下，还是选胸" + a + "的吧。")
                    }
                } else d("我还没有准备好！薛定谔生气地拒绝作出选择。")
            };
            return D.numData[t.point].tOTAL >= dt.mode[o.pf].ybsjjchkssy && D.numData[t.point].mAX != D.numData[t.point].mIN ? D.numData[t.point].mIN > D.numData[t.point].mAX ? "LOW" : "HIGH" : t.point > dt.dsbdgdfsds ? "LOW" : t.point < dt.dsbdgdfsds ? "HIGH" : Math.random() > .5 ? "HIGH" : "LOW"
        },
        yon: function () {
            if (C.issinglecard()) return !0x0;
            var t = R.doub(0x2);
            if (dt.mode[o.pf].yxyzdd && R.medal() >= dt.mode[o.pf].bqdydshksyzdd && t.point in D.numData && D.numData[t.point].tOTAL >= dt.mode[o.pf].ybsjdsfcyxyzdd) return d("Fairy Fevering", 0x2),
                !0x0;
            var e = dt.mode[o.pf].dsbydzxdsjbyjx;
            (y.doubletimes >= dt.mode[o.pf].dsblxhsjhhhjrjszt || R.bet() >= dt.mode[o.pf].dsbycmdddshjrjszt) && (d("AT-Field FullPower", 0x2), e = dt.mode[o.pf].dsbjsztxydzxdsjbyjx);
            for (var n = 0x0, a = e.length; a > n; n++) if (t.point == e[n]) return d("Oh my god!出现了不再继续的卡片:" + t, 0x4),
                !0x1;
            return !0x0
        }
    },
    P = {
        sleep: function (e) {
            if (y.timeout++ > 0x14) return void location.reload();
            var n = dt.mode[o.pf].djdzycjm + Math.random() * dt.mode[o.pf].sjzjdycms;
            if (d("zZＺ", 0x2), press(".btn-usual-ok:visible"), t = setTimeout(e, 1e3 * n), C.captcha()) {
                tt.text("有验证"),
                    U();
                var a = new Date,
                    s = a.getHours() + ":" + a.getMinutes() + ":" + a.getSeconds();
                d("哦买糕," + s + ".好像出现验证码了", 0x5),
                    window._alert ? _alert("有验证") : alert("有验证")
            } else C.err() && (U(), location.reload())
        },
        deck: function () {
            switch (y.deck) {
                case 0x0:
                    if ((new Date).getTime() >= o.st1) return void Q();
                    if (e) return e = !0x1,
                        tt.text("启动"),
                        Z.text("下局停"),
                        void U();
                    C.canstart() && (y.timeout = 0x0, F.tapstart(), g.ljpzyxcs++, y.deck++),
                        P.sleep(P.deck);
                    break;
                case 0x1:
                    if (C.canok()) {
                        y.timeout = 0x0,
                        g.mjcm || (g.mjcm = R.bet()),
                            d("桌上出现的卡片为:" + R.deck().join(","), 0x2);
                        var t = K.keep();
                        for (var n in t) F["keep" + n + "pos"]();
                        F.tapok(),
                            y.deck++
                    };
                    P.sleep(P.deck);
                    break;
                case 0x2:
                    C.canyesno() ? (y.timeout = 0x0, F.tapyes(), d("进入双倍", 0x3), y.deck = 0x0, g.ljsbyxcs++, P.sleep(P.doub)) : C.canstart() ? (y.timeout = 0x0, d("失败", 0x3), y.deck = 0x0, P.deck()) : P.sleep(P.deck);
                    break;
                case 0x3:
                    y.deck = 0x0,
                        P.sleep(P.doub)
            }
        },
        doub: function () {
            switch (y.doubleup) {
                case 0x0:
                    if (C.canhighlow()) {
                        y.timeout = 0x0;
                        var t = K.hol();
                        y.lastchoice = t,
                            F["tap" + t.toLowerCase()](),
                            y.doubleup++
                    };
                    P.sleep(P.doub);
                    break;
                case 0x1:
                    if (C.canyesno()) {
                        y.timeout = 0x0,
                            q(),
                            W(0x1),
                            d("愉♂悦吧!双赔获胜", 0x4),
                            y.doubletimes++,
                        y.doubletimes > g.sbzghs && (g.sbzghs = y.doubletimes),
                            g.ljsbddcs++,
                            h("我早就看到是这个结局了，像我这种天才少女怎么可能会有控制不了的概率呢？哦呵呵呵呵～" + a + "薛定谔自豪地挺了挺胸。虽然她没有。", "切！薛定谔在角落里嘟囔了一句。");
                        var e = R.bet();
                        if (d("累计赌对" + y.doubletimes + "回,当前筹码:" + e, 0x5), dt.mode[o.pf].dsblxhsjhhhtz <= y.doubletimes || dt.mode[o.pf].dsbcmdddshtz <= e) return F.tapno(),
                            y.doubletimes = 0x0,
                            y.doubleup = 0x0,
                            void P.sleep(P.deck);
                        if (K.yon()) F.tapyes(),
                            y.doubleup = 0x0,
                            P.sleep(P.doub);
                        else {
                            var n = R.bet();
                            F.tapno(),
                                d("收入" + n, 0x5),
                                y.doubleup = 0x0,
                                y.doubletimes = 0x0,
                                P.sleep(P.deck)
                        }
                    } else if (C.canstart()) {
                        if (y.timeout = 0x0, q(), W(0x2), C.issinglecard()) d("Holy shit!双倍失败!出现的卡片是:" + R.doub(0x1), 0x4),
                            g.ljsbdccs++;
                        else if ("HIGH" == y.lastchoice && R.doub(0x1).point <= R.doub(0x2).point || "HIGH" != y.lastchoice && R.doub(0x1).point >= R.doub(0x2).point) {
                            d("Oh my god!达到回合上限", 0x4);
                            var n = R.bet();
                            h("我早就看到是这个结局了，像我这种天才少女怎么可能会有控制不了的概率呢？哦呵呵呵呵～" + a + "薛定谔自豪地挺了挺胸。虽然她没有。", "切！薛定谔在角落里嘟囔了一句。"),
                                d("收入" + n, 0x5),
                                g.ljsbddcs++
                        } else d("Holy shit!双倍失败!出现的卡片是:" + R.doub(0x2), 0x4),
                            g.ljsbdccs++,
                            h("哇咔咔咔～活该！让你不听天才少女的忠告！" + a + "薛定谔用非常亲切和蔼地表情对你说道。", "这！这不可能！一定是CY使诈！薛定谔愤怒地一拳砸在你的屏幕上。");
                        y.doubleup = 0x0,
                            y.doubletimes = 0x0,
                            P.deck()
                    } else P.sleep(P.doub)
            }
        }
    },
    Y = function () {
        if (!y.running) {
            g.csyxcm = R.medal(),
                z();
            var t = (new Date).getTime();
            if (o.st1 && o.st2 && t > o.st1 && t < o.st2) return void Q();
            B(),
                y.running = !0x0,
                P.sleep(P.deck)
        }
    },
    B = function () {
        var t = (new Date).getTime();
        o.st1 = t + 0x3c * dt.mode[o.pf].zdzsbcgjxs * 0x3c * 1e3,
            o.st2 = o.st1 + 0x3c * (dt.mode[o.pf].zdzstzhxxjxszjxzs + dt.mode[o.pf].sjzjdxxxss * Math.random()) * 0x3c * 1e3,
            M()
    },
    Q = function () {
        var e = o.st2 - (new Date).getTime();
        d("已停止值守，并在" + Math.round(e / 1e3 / 60 / 0x6) / 0xa + "小时后重新值守", 0x2),
            y.running = !0x1,
            t = setTimeout(Y, e)
    },
    U = function () {
        clearTimeout(t),
            y.running = !0x1
    },
    V = $("<div class="wg"><style>.wg{position:absolute;z-index:250001;top:12px;left:0;width:180px;}.wg button{float:left;width:42px;height:22px;margin:1px;padding:0;}</style></div>").appendTo(document.body),
    Z = $("<button style="width:52px">下局停</button>").appendTo(V),
    tt = $("<button style="width:52px">停止</button>").appendTo(V),
    et = $("<button>高速</button>").appendTo(V),
    nt = $("<button>设置</button>").appendTo(V),
    ot = ($("<button>记录</button>").appendTo(V), $("<button>LoG</button>").appendTo(V), $("<button title="清空样本数据&#10;!本次更新第1次运行必须清空!&#10;以防脚本不正常工作">初始化</button>").appendTo(V)),
at = $("<div class="wgseting" style="display:none"><style>.wgseting{position:absolute;left:0;top:60px;z-index:100;background-color:white;margin:0px}.wgseting p{margin:0px;font-size:10px;}.wgseting button{padding-top:0px;padding-bottom:0;height:15px;font-size:10px;line-height:50%}</style><p data-option="y1" data-operate="num">模式名:<button></button></p><p data-option="y2" data-operate="num">样本收集几次后开始使用:<button></button></p><p data-option="y3" data-operate="arr">赌双倍遇到这些点数就不要继续:<button></button></p><p data-option="y4" data-operate="num">赌双倍连续获胜几回合后进入谨慎状态:<button></button></p><p data-option="y5" data-operate="num">赌双倍赢筹码达到多少后进入谨慎状态:<button></button></p><p data-option="y6" data-operate="arr">赌双倍谨慎状态下遇到这些点数就不要继续:<button></button></p><p data-option="y7" data-operate="num">赌双倍连续获胜几回合后停止:<button></button></p><p data-option="y8" data-operate="num">赌双倍筹码达到多少后停止:<button></button></p><p data-option="y9" data-operate="tof">允许一站到底:<button></button></p><p data-option="y10" data-operate="num">本钱大于多少后开始一站到底:<button></button></p><p data-option="y11" data-operate="num">样本收集多少份才允许一站到底:<button></button></p><p data-option="y12" data-operate="num">点击动作延迟几秒:<button></button></p><p data-option="y13" data-operate="num">随机增加的延迟秒数:<button></button></p><p data-option="y14" data-operate="num">自动值守不超过几小时:<button></button></p><p data-option="y15" data-operate="num">自动值守停止后休息几小时再继续值守:<button></button></p><p data-option="y16" data-operate="num">随机增加的休息小时数:<button></button></p><p data-option="y17" data-operate="num">收集的样本在每天几点时过期:<button></button></p><p data-option="y18" data-operate="num">样本可信度分母:<button></button></p><p data-option="y19" data-operate="num">赌双倍的高低分水点数:<span><input type="text" value="" /></span></p><p data-option="y20" data-operate="tof">是否在控制台输出信息:<button></button></p><p data-option="y21" data-operate="tof">立即自动值守:<button></button></p><p data-option="y22" data-operate="tof">薛定谔陪你玩:<button></button></p></div>").insertAfter(V),
    st = function (t) {
        switch (t.dataset.option) {
            case "y1":
                return dt.mode[o.pf].modeName;
            case "y2":
                return dt.mode[o.pf].ybsjjchkssy;
            case "y3":
                return dt.mode[o.pf].dsbydzxdsjbyjx;
            case "y4":
                return dt.mode[o.pf].dsblxhsjhhhjrjszt;
            case "y5":
                return dt.mode[o.pf].dsbycmdddshjrjszt;
            case "y6":
                return dt.mode[o.pf].dsbjsztxydzxdsjbyjx;
            case "y7":
                return dt.mode[o.pf].dsblxhsjhhhtz;
            case "y8":
                return dt.mode[o.pf].dsbcmdddshtz;
            case "y9":
                return dt.mode[o.pf].yxyzdd;
            case "y10":
                return dt.mode[o.pf].bqdydshksyzdd;
            case "y11":
                return dt.mode[o.pf].ybsjdsfcyxyzdd;
            case "y12":
                return dt.mode[o.pf].djdzycjm;
            case "y13":
                return dt.mode[o.pf].sjzjdycms;
            case "y14":
                return dt.mode[o.pf].zdzsbcgjxs;
            case "y15":
                return dt.mode[o.pf].zdzstzhxxjxszjxzs;
            case "y16":
                return dt.mode[o.pf].sjzjdxxxss;
            case "y17":
                return dt.sjdybzmtjdsgq;
            case "y18":
                return dt.ybkxdfm;
            case "y19":
                return dt.dsbdgdfsds;
            case "y20":
                return dt.sfzkztscxx;
            case "y21":
                return dt.ljzdzs;
            case "y22":
                return dt.xdepnw
        }
    },
    dt = {
        mode: [{
            modeName: "高速模式",
            ybsjjchkssy: 0x14,
            dsbydzxdsjbyjx: [],
            dsblxhsjhhhjrjszt: 0x7,
            dsbycmdddshjrjszt: 2e5,
            dsbjsztxydzxdsjbyjx: [0x7, 0x8, 0x9],
            dsblxhsjhhhtz: 0xc,
            dsbcmdddshtz: 2e6,
            yxyzdd: !0x0,
            bqdydshksyzdd: 5e4,
            ybsjdsfcyxyzdd: 0x1e,
            djdzycjm: 1.5,
            sjzjdycms: 0x1,
            zdzsbcgjxs: 3.5,
            zdzstzhxxjxszjxzs: .2,
            sjzjdxxxss: 0x0
        },
            {
                modeName: "安全模式",
                ybsjjchkssy: 0x14,
                dsbydzxdsjbyjx: [],
                dsblxhsjhhhjrjszt: 0x7,
                dsbycmdddshjrjszt: 5e4,
                dsbjsztxydzxdsjbyjx: [0x7, 0x8, 0x9],
                dsblxhsjhhhtz: 0xc,
                dsbcmdddshtz: 5e5,
                yxyzdd: !0x0,
                bqdydshksyzdd: 5e4,
                ybsjdsfcyxyzdd: 0x1e,
                djdzycjm: 0x2,
                sjzjdycms: 0x2,
                zdzsbcgjxs: 0x3,
                zdzstzhxxjxszjxzs: 0x1,
                sjzjdxxxss: 0x1
            }],
        sjdybzmtjdsgq: 0x0,
        ybkxdfm: 0x30,
        dsbdgdfsds: 0x8,
        sfzkztscxx: !0x0,
        ljzdzs: !0x0,
        xdepnw: !0x0
    };
J.prototype.toString = function () {
    return 0x63 != this.cOlOr ? ["黑桃", "红桃", "方块", "草花"][this.cOlOr - 0x1] + (this.point > 0xa ? ["J", "Q", "K", "A"][this.point - 0xb] : this.point) : "JOKER"
},
    S(),
    k(),
    T(),
    H(),
    window.wg = {},
    Object.defineProperties(wg, {
        debug: {
            get: j
        },
        "\u542f\u52a8": {
            get: Y
        },
        "\u505c\u6b62": {
            get: U
        },
        "\u60c5\u51b5": {
            get: f
        },
        "\u6837\u672c": {
            get: O
        }
    }),
dt.ljzdzs && Y(),
0x1 == o.pf && et.text("安全"),
    tt.on(n, function () {
        "停止" == tt.text() ? (tt.text("启动"), U()) : (tt.text("停止"), Y())
    }),
    et.on(n, function () {
        "高速" == et.text() ? (et.text("安全"), o.pf = 0x1, B()) : (et.text("高速"), o.pf = 0x0, B()),
            d("切换至" + dt.mode[o.pf].modeName)
    }),
    Z.on(n, function () {
        y.running && (Z.text("知道啦"), e = !0x0)
    }),
    nt.on(n, function () {
        at.toggle(),
            at.find("P").each(function (t) {
                var e = st(this);
                $(this).children().text(e)
            })
    }),
    ot.on(n, function () {
        localStorage.removeItem("wg_casino_poker_samples"),
            localStorage.removeItem("wg_casino_poker_samples2"),
            localStorage.removeItem("wg_casino_poker_config"),
            ot.text("请刷新")
    }),
    at.find("P").on(n, function () {
        "tof" == this.dataset.operate && ("true" == $(this).children().text() ? $(this).children().text(!0x1) : $(this).children().text(!0x0))
    }),
    window._alert = window.alert,
    window.alert = function (t) {
        var e = new Date,
            n = e.getHours() + ":" + e.getMinutes() + ":" + e.getSeconds();
        console.info(n + "出现弹窗:%c" + t, "color:white; background-color:#B03939")
    };
var it = {
    start: function () {
        var t = "1.4.4";
        $("<div class="wgver" style="position:absolute;z-index:250001;top:0;right:0"><button style="width:110px">CoreVer: " + t + "</button></div>").appendTo(document.body),
            setTimeout(it.del, 2e3)
    },
    del: function () {
        $(".wgver").remove()
    }
};
it.start(),
    console.info("start")
