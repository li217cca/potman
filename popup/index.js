const state = default_state
console.log("default_state", default_state)

const conn = chrome.runtime.connect()
conn.onMessage.addListener(event => {
    console.log("get", event)
    switch (event.type) {
        case evt.CONN_SUCCESS: {
            conn.postMessage({type: evt.REQUIRE_STATE})
            break
        }
        case evt.GET_STATE: {
            Object.assign(state, event.state)
            refresh()
            break
        }
    }
})
const postSetState = (state) => {
    conn.postMessage({
        type: evt.SET_STATE,
        state: state
    })
}

const refreshMethods = []
const refresh = () => {
    console.log("popup refresh")
    refreshMethods.forEach(method => method())
}

const loadFunc = []
const onLoad = () => {
    loadFunc.forEach(f => f())
    refresh()
}
window.addEventListener("load", onLoad, false)

const processButton = (innerTextFunc, onclick) => {
    const cb = () => {
        const button = document.createElement("button")
        button.onclick = onclick
        button.innerText = "loading.."
        document.body.appendChild(button)
        refreshMethods.push(() => {
            button.innerText = innerTextFunc()
        })
    }
    loadFunc.push(cb)
}
processButton(() => {
    return state.run ? "停止" : "运行"
}, () => postSetState({run: !state.run}))
processButton(() => {
    return state.prpr ? "停止prpr" : "运行prpr"
}, () => postSetState({prpr: !state.prpr}))
processButton(() => {
    return state.prpr_auto ? "停止自动prpr" : "运行自动prpr"
}, () => postSetState({prpr_auto: !state.prpr_auto}))
processButton(() => {
    return state.coop_run ? "停止coop" : "运行coop"
}, () => postSetState({coop_run: !state.coop_run}))
processButton(() => {
    return state.coop_first ? "coop非尾刀" : "coop尾刀"
}, () => postSetState({coop_first: !state.coop_first}))
processButton(() => {
    return state.auto_battle ? "自动战斗开启" : "自动战斗关闭"
}, () => postSetState({auto_battle: !state.auto_battle}))
processButton(() => {
    return state.auto_confirm_pending ? "自动确认Raids〇" : "自动确认Raids✕"
}, () => postSetState({auto_confirm_pending: !state.auto_confirm_pending}))
