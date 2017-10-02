const state = {}

const conn = chrome.runtime.connect()
conn.onMessage.addListener(event => {
    console.log("get", event)
    switch (event.type) {
        case "connSuccess": {
            conn.postMessage({type: "requireState"})
            conn.postMessage({type: "popConn"})
            break
        }
        case "getState": {
            Object.assign(state, event.state)
            refresh()
            break
        }
    }
})

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

const processRunButton = () => {
    const runButton = document.createElement("button")
    runButton.onclick = () => {
        conn.postMessage({
            type: "setState", 
            state: {run: !state.run}}
        )
    }
    runButton.innerText = "loading.."
    document.body.appendChild(runButton)

    refreshMethods.push(() => {
        runButton.innerText = state.run ? "停止" : "运行"
    })
}
loadFunc.push(processRunButton)

const processPrprButton = () => {
    const prprButton = document.createElement("button")
    prprButton.onclick = () => {
        conn.postMessage({
            type: "setState", 
            state: {prpr: !state.prpr}}
        )
    }
    prprButton.innerText = "loading.."
    document.body.appendChild(prprButton)

    refreshMethods.push(() => {
        prprButton.innerText = state.prpr ? "停止prpr" : "运行prpr"
    })
}
loadFunc.push(processPrprButton)

const processAutoPrprButton = () => {
    const button = document.createElement("button")
    button.onclick = () => {
        conn.postMessage({
            type: "setState", 
            state: {prpr_auto: !state.prpr_auto}}
        )
    }
    button.innerText = "loading.."
    document.body.appendChild(button)

    refreshMethods.push(() => {
        button.innerText = state.prpr_auto ? "停止自动prpr" : "运行自动prpr"
    })
}
loadFunc.push(processAutoPrprButton)

// {
//     run: false,
//     host: false,
//     first: false
// }
const processCoopButton = () => {
    const runButton = document.createElement("button")
    const firstButton = document.createElement("button")
    runButton.onclick = () => {
        conn.postMessage({
            type: "setState", 
            state: {coop: {...state.coop, run: !state.coop.run}}}
        )
    }
    firstButton.onclick = () => {
        conn.postMessage({
            type: "setState", 
            state: {coop: {...state.coop, first: !state.coop.first}}}
        )
    }
    runButton.innerText = firstButton.innerText = "loading.."
    document.body.appendChild(runButton)
    document.body.appendChild(firstButton)

    refreshMethods.push(() => {
        runButton.innerText = state.coop.run ? "停止coop" : "运行coop"
        firstButton.innerText = state.coop.first ? "coop非尾刀" : "coop尾刀"
    })
}
loadFunc.push(processCoopButton)

const processAutoBattleButton = () => {
    const button = document.createElement("button")
    button.onclick = () => {
        conn.postMessage({
            type: "setState", 
            state: {auto_battle: !state.auto_battle}
        })
    }
    button.innerText = "loading.."
    document.body.appendChild(button)

    refreshMethods.push(() => {
        button.innerText = state.auto_battle ? "自动战斗开启" : "自动战斗关闭"
    })
}
loadFunc.push(processAutoBattleButton)


const processConfirmPending = () => {
    const button = document.createElement("button")
    button.onclick = () => {
        conn.postMessage({
            type: "setState", 
            state: {auto_confirm_pending: !state.auto_confirm_pending}
        })
    }
    button.innerText = "loading.."
    document.body.appendChild(button)

    refreshMethods.push(() => {
        button.innerText = state.auto_confirm_pending ? "自动确认Raids〇" : "自动确认Raids✕"
    })
}
loadFunc.push(processConfirmPending)