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

const processButton = (refreshFunc, onclick) => {
    const cb = () => {
        const button = document.createElement("button")
        button.onclick = onclick
        button.innerText = "loading.."
        document.body.appendChild(button)
        refreshMethods.push(() => {
            refreshFunc(button)
        })
    }
    loadFunc.push(cb)
}
processButton(button => {
    button.style.display = state.dev ? "block" : "none"
    button.innerText = state.run ? "运行〇" : "运行✕"
}, () => postSetState({run: !state.run}))
processButton(button => {
    button.innerText = state.prpr ? "prpr〇" : "prpr✕"
}, () => postSetState({prpr: !state.prpr}))
processButton(button => {
    button.style.display = state.dev ? "block" : "none"
    button.innerText = state.prpr_auto ? "自动prpr〇" : "自动prpr✕"
}, () => postSetState({prpr_auto: !state.prpr_auto}))
const processDeckID = () => {
    const input = document.createElement("input")
    input.onchange = ({target}) => {
        console.log("prpr_deck", target.value.split("").map(a => parseInt(a)).slice(0, 2))
        postSetState({prpr_deck: target.value.split("").map(a => parseInt(a)).slice(0, 2)})
    }
    input.innerText = "loading.."
    input.style.width = "100%"
    input.type = "number"
    input.placeholder = "prpr编组，如（31）"
    document.body.appendChild(input)
    refreshMethods.push(() => {
        input.value = !!state.prpr_deck ? state.prpr_deck.join("") : ""
    })
}
loadFunc.push(processDeckID)
const processSupporter = () => {
    const input = document.createElement("input")
    input.onchange = ({target}) => {
        if (target.value.length < 1) return
        console.log("prpr_supporter", target.value.split(" ").filter(key => key.length > 0))
        postSetState({prpr_supporter: target.value.split(" ").filter(key => key.length > 0)})
    }
    input.innerText = "loading.."
    input.style.width = "100%"
    input.placeholder = "prpr召唤"
    document.body.appendChild(input)
    refreshMethods.push(() => {
        input.value = state.prpr_supporter.join(" ")
    })
}
loadFunc.push(processSupporter)
processButton(button => {
    button.innerText = state.prpr_attack ? "prpr自动攻击〇" : "prpr自动攻击✕"
}, () => postSetState({prpr_attack: !state.prpr_attack}))
// processButton(() => {
//     return state.coop_run ? "停止coop" : "运行coop"
// }, () => postSetState({coop_run: !state.coop_run}))
// processButton(() => {
//     return state.coop_first ? "coop非尾刀" : "coop尾刀"
// }, () => postSetState({coop_first: !state.coop_first}))

processButton(button => {
    button.style.display = state.dev ? "block" : "none"
    button.innerText = state.auto_battle ? "自动战斗〇" : "自动战斗✕"
}, () => postSetState({auto_battle: !state.auto_battle}))
processButton(button => {
    button.style.display = state.dev ? "block" : "none"
    button.innerText = state.auto_confirm_pending ? "自动确认Raids〇" : "自动确认Raids✕"
}, () => postSetState({auto_confirm_pending: !state.auto_confirm_pending}))

processButton(button => {
    button.innerText = state.coop_run ? "coop〇" : "coop✕"
}, () => postSetState({coop_run: !state.coop_run}))
processButton(button => {
    button.innerText = state.coop_first ? "coop首刀〇" : "coop尾刀"
}, () => postSetState({coop_first: !state.coop_first}))

const processDev = () => {
    const input = document.createElement("input")
    input.onchange = ({target}) => {
        if (target.value === "DEV") {
            postSetState({dev: true})
        }
    }
    input.style.width = "100%"
    input.placeholder = "authentication"
    document.body.appendChild(input)
    refreshMethods.push(() => {
        input.style.display = state.dev ? "none" : "block"
    })
}
loadFunc.push(processDev)
processButton(button => {
    button.style.display = state.dev ? "block" : "none"
    button.innerText = "CLOSE_DEV"
}, () => postSetState({dev: false}))