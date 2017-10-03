
const _model = (() => {
    const _state = {
        halt: false,
        run: true,
        captcha: false,
        error: false,
    }
    const _listenList = new Set()
    const _update = (state) => {
        // _myLog("model state update", state)
        Object.assign(_state, state)
        _listenList.forEach(cb => cb())
    }

    const _makeWait = (func) => {
        return async () => {
            return await new Promise((resolve, reject) => {
                const cb = () => {
                    if (_state.halt) {
                        _myLog("process halt...")
                        reject("process halt")
                        return
                    }
                    if (func(_state) && _state.run && !_state.captcha && !_state.error) {
                        resolve()
                        _listenList.delete(cb)
                    }
                }
                _listenList.add(cb)
                cb()
            })
        }
    }
    return {
        update: _update,
        makeWait: _makeWait
    }
}) ()

const _waitModelRun = _model.makeWait(() => true) // async () =>
const _waitModelBP3 = _model.makeWait(state => !!state.bp && state.bp > 2) // async () =>

const _myLog = (...args) => {
    if (args.length < 1) return
    var time = new Date()
    return console.info("[" + time.toLocaleString() + "]", ...args)
}

const _waitTime = async (ms) => {
    await _waitModelRun()
    return new Promise(resolve => {
        setTimeout(resolve, ms)
    })
}

const _waitElement = async (selector) => {
    if (typeof selector !== "string") return selector
    await _waitModelRun()
    const check = async (resolve) => {
        await _waitModelRun()
        const jq = $(selector)
        if (jq.length > 0) {
            resolve(jq)
        } else {
            setTimeout(() => {check(resolve)}, 1000)
        }
    }
    return new Promise(resolve => {
        check(resolve)
    })
}


const _get_rect = function (handle) {
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

const _pressElement = async (selector) => {
    await _waitModelRun()
    if (!(selector instanceof jQuery)) {
        selector = $(selector)
    }
    return _pressElementByJQuery(selector)
}
const _pressElementByJQuery = function (jq) { // click事件
    var rect = _get_rect(jq)
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
            handle = jq;
        0x0 != handle.length && (handle[0x0].dispatchEvent(mousedown), handle[0x0].dispatchEvent(mouseup))
        return true
    } else {
        return false
    }
}


const _popup = (() => {
    let _run = false
    let _pending = []
    return {
        popup: (msg, ms = 3000) => {
            // _myLog("popup", msg, "for", ms, "ms")
            const cb = () => {
                const div = document.createElement("div")
                div.innerHTML = msg.toString()
                pops.appendChild(div)
                if (!!ms && ms > 0) setTimeout(() => {
                    pops.removeChild(div)
                }, ms)
            }
            if (_run) {
                cb()
            } else {
                _pending.push(cb)
            }
        },
        init: () => {
            // _myLog("popup init")
            pops = document.createElement("div")
            pops.style.position = "fixed"
            pops.style.left = "75px"
            pops.style.color = "#FEF"
            pops.style.zIndex = 999999
            pops.style.fontSize = "20px"
            pops.style.borderRadius = "4px"
            pops.style.backgroundColor = "#333"
            pops.style.opacity = 0.8
            document.body.appendChild(pops)
            _run = true
            _pending.forEach(f => f())
            _pending = []
        }
    }
}) ()

_waitElement("body").then(_popup.init)


const _lock = (() => {
    let _lock = false, _token = 0
    const _waitList = []
    const _unlock = () => {
        _myLog("Unlock")
        _lock = false
        _waitList.filter(cb => {
            cb()
            return false
        })
    }
    return {
        lock: (ms) => {
            _myLog("Lock for", ms, "ms")
            _lock = true
            _token = Math.random() * 100000
            const preToken = _token
            setTimeout(() => {
                if (preToken === _token) {
                    _unlock()
                }
            }, ms)
        },
        unlock: _unlock,
        wait: async () => {
            await _waitModelRun()
            return new Promise(resolve => {
                if (!_lock) {
                    resolve()
                } else {
                    _waitList.push(resolve)
                }
            })
        }
    }
}) ()