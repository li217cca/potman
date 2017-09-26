
!
function main() {
    var log = console.info
    var state = {captcha: false}

    var conn = chrome.runtime.connect()
    conn.onMessage.addListener(function (event) {
        var flag = false
        if (!state.run && event.run) flag = true
        Object.assign(state, event)
        re_listen()
        if (flag) {
            log("科技罐头人启动")
            setTimeout(loop, rand_time(2e3))
        }
    })

    const is_run = function () {
        return state.run && !state.captcha
    }
    const is_visible = function (t) {
        return $(t).is(":visible")
    }
    const rand_time = function (t) {
        return (Math.random() * t + t) / state.speed
    }
    const visible = function (t) {
        return function () {
            return is_visible(t)
        }
    }
    const get_rect = function (handle) {
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
    }
    const press = function (className) { // click事件
        className = className+":last"
        if (!run) return
        var rect = get_rect(className);
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
            0x0 != handle.length && (handle[0x0].dispatchEvent(mousedown), handle[0x0].dispatchEvent(mouseup))
        } else {
            console.info(rect.y, rect.x)
        }
    }

    const listen = function (fun, cb, once) {listeners.push({fun: fun, cb: cb, once: once})}
    var listeners = []
    const loop = function () {
        if (!state.run) {
            log("科技罐头人停止")
            return
        }
        log("Zzz")
        listeners.filter(function (i) {
            return !(is_run() && i.fun() && i.cb() && i.once)
        })
        setTimeout(loop, rand_time(1e3))
    }
    const re_listen = function () {
        listeners = []
        listen(visible(".txt-title:contains(エラー)"), function () {
            state.captcha = true;
            log("出现验证码！")
            listen(function () {return !is_visible(".prt-popup-header:contains(画像認証)")}, function () {state.captcha = false; log("没有了验证码")}, true)
        })
        listen(visible(".prt-popup-header:contains(画像認証)"), location.reload)
        if (state.listen.repeat) listen(visible(".btn-repeat-last"), function () {
            log("点击上次开设");press(".btn-repeat-last")
        })
        if (state.listen.attack) listen(visible(".btn-attack-start.display-on"), function () {
            log("点击攻击");
            if (state.listen.result) listen(visible(".prt-turn-info.anim-on"), function () {
                setTimeout(function () {
                    log("刷新至结果");press(".btn-global-coopraid")//prt-result-head
                    if (state.listen.coop) listen(visible(".prt-result-head"), function () {
                        log("刷新至共斗");press(".btn-global-coopraid")//prt-result-head
                    }, true)
                }, rand_time(3e2))}, true)
            press(".btn-attack-start.display-on")
        })
        if (state.listen.skill) {
            // todo
            // listen(visible(".btn-attack-start.display-on"), function () {
            // })
        }
        if (state.listen.prepare) {
            listen(visible(".btn-execute-ready.se-ok"), function () {
                log("点击准备");press(".btn-execute-ready.se-ok")
            })
        }
        if (state.listen.start) listen(visible(".btn-quest-start.multi.se-quest-start.onm-tc-gbf"), function () {
            log("点击start");press(".btn-quest-start.multi.se-quest-start.onm-tc-gbf")
        })
    }
}();