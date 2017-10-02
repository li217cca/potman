
const state = (() => {
    const s = default_state
    const listeners = []
    const stateRun = () => s.run && !s.captcha && !s.error
    return {
        run: () => stateRun(),
        observeRun: () => stateRun() && s.observe,
        prprRun: () => stateRun() && s.prpr,
        prprAutoRun: () => stateRun() && s.prpr_auto,
        logRun: () => s.onlog,
        coop: {
            run: () => stateRun() && s.coop.run,
            host: () => s.coop.host,
            first: () => s.coop.first
        },
        auto_battle: () => stateRun() && s.auto_battle,
        auto_confirm_pending: () => stateRun() && s.auto_confirm_pending,
        set: (obj) => {
            Object.assign(s, obj)
            listeners.forEach(listener => listener())
        },
        listen: (listener) => {
            listeners.push(listener)
        }
    }
}) ()

const status = {}
    

const conn = chrome.runtime.connect()
let unlisten = false
conn.onMessage.addListener(event => {
    log("get", event)
    switch (event.type) {
        case "connSuccess": {
            conn.postMessage({type: "requireState"})    // post require request
            conn.postMessage({type: "contentConn"})     // post my name
            conn.postMessage({type: "getStatus"})
            break
        }
        case "getState": {
            state.set(event.state)
            break
        }
        case "status": {
            log("status get", event.status)
            Object.assign(status, event.status)
            break
        }
        // case "checkBattleKey": {
        //     tryJoinRaid(event.resp)
        //     break
        // }
        case "copyRaid": {
            if (state.prprRun()) {        
                tryJoinRaid(event.raidCode)
            }
            break
        }
        case "listenRaid": {
            log("listen raid", event.raidCode)
            if (state.prprAutoRun() && !unlisten) {        
                tryJoinRaid(event.raidCode)
            }
            break
        }
    }
})