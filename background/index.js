
const state = default_state
const str = localStorage.getItem("options")
let preState = {}
try {
    preState = JSON.parse(str)
} catch(e) {
    log("error", e)
}

Object.assign(state, preState)
const conns = new Set()
const superPostMessage = (msg) => {
    conns.forEach(conn => {
        conn.postMessage(msg)
    })
}
const doPopup = (msg) => {
    superPostMessage({type: "DO_POPUP", msg: msg})
}
const log = (...args) => {
    superPostMessage({type: evt.ACTION_LOG, request: ["BACK:", ...args]})
    console.log(...args)
}
const refreshState = () => {
    superPostMessage({type: evt.GET_STATE, state})
    localStorage.setItem("options", JSON.stringify(state))
    _listenList.forEach(cb => cb(state))
}
const _listenList = new Set()
const waitState = (func) => {
    return async () => {
        return await new Promise((resolve, reject) => {
            const cb = (state) => {
                if (state.halt) {
                    log("> Process halt! <")
                    reject("process halt")
                    return
                }
                if (func(state) && state.run && !state.captcha && !state.error) {
                    resolve()
                    _listenList.delete(cb)
                }
            }
            _listenList.add(cb)
            cb(state)
        })
    }
}
let main_conn = null, main_conn_wait_list = []
const waitRun = waitState(() => true)
const waitMainConn = async () => {
    return new Promise(resolve => {
        if (main_conn !== null) {
            resolve()
        } else {
            main_conn_wait_list.push(resolve)
        }
    })
}
const _postList = new Set()
const post = async (type, msg) => {
    await waitRun()
    await waitMainConn()
    return new Promise(resolve => {
        let success = false
        const tmp = {type: type, request: msg}
        _messageListenList[type + "_CALLBACK"] = (event) => {
            delete _messageListenList[type + "_CALLBACK"]
            success = true
            _postList.delete(tmp)
            if (state.run) resolve(event.response)
        }
        _postList.add(tmp)
        superPostMessage(tmp)
    })
}
const _waitBossDie = async (pos) => {
    return new Promise(resolve => {
        _messageListenList[evt.BOSS_DIE] = (event) => {
            if (!pos || pos === event.pos) {
                delete _messageListenList[evt.BOSS_DIE]
                resolve(event.pos)
            }
        }
    })
}
const updateState = (next) => {
    log("UPDATE STATE", next)
    Object.assign(state, next)
    refreshState()
}
const _messageListenList = {}
chrome.runtime.onConnect.addListener(function(conn) {
    conns.add(conn)
    conn.postMessage({type: evt.CONN_SUCCESS})
    conn.onDisconnect.addListener(event => {
        conns.delete(conn)
        if (main_conn === conn) {
            console.log("main channel disconnect")
            main_conn = null
        }
    })
    conn.onMessage.addListener(function(event) {
        if (!!_messageListenList[event.type]) {
            _messageListenList[event.type](event)
            return
        }
        switch (event.type) {
            case evt.REQUIRE_STATE: {
                conn.postMessage({type: evt.GET_STATE, state: state})
                break
            }
            case evt.SET_STATE: {
                updateState(event.state)
                break
            }
            case evt.BOSS_DIE: {
                log("boss die in", evt.pos)
                break
            }
            case evt.GET_RAID_ID_FROM_COPY: {
                if (state.prpr && !_theLock) {
                    autoBattlePrpr(event.raid_id)
                } else {
                    doPopup("直前时间中")
                }
                break
            }
            case evt.GET_RAID_ID_FROM_LISTEN: {
                if (state.prpr_auto && !_theLock) {
                    autoBattleAutoPrpr(event.raid_id)
                }
                break
            }
            case evt.MAIN_CHANNEL: {
                console.log("main channel connect")
                main_conn = conn
                main_conn_wait_list.forEach(cb => cb())
                main_conn_wait_list = []
                _postList.forEach(msg => superPostMessage(msg))
                break
            }
            default: {
                // superPostMessage(event)
            }
        }
    })
})
// TODO: 任务流，任务Group流等。。。
let _theLock = false, _lockToken = 0
const _lock = (ms = 1800000) => {
    console.log("lock for", ms, "ms")
    _theLock = true
    _lockToken = Math.random()*10000
    _postList.clear()
    const token = _lockToken
    setTimeout(() => {
        unlock(token)
    }, ms)
    return token
}
let _waitLockList = []
const _waitLock = async () => {
    return new Promise(resolve => {
        if (!_theLock) {
            resolve()
            return
        }
        _waitLockList.push(resolve)
    })
}
const _unlock = (token) => {
    if (!token) {
        error("not token!")
    }
    if (token !== _lockToken && token !== "super") return
    _postList.clear()
    console.log("unlock", token)
    _theLock = false
    _waitLockList.forEach(callback => callback())
    _waitLockList = []
}