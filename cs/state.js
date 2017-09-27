
const state = (() => {
    const s = {
        run: false,     // all run need, exceipt log
        observe: true, // observer run need
        speed: 1,      
        prpr: false,
        captcha: false,
        error: false,
        coop: {
            run: false,
            first: false
        },
        auto_battle: false,
    
        onlog: true     // log run need
    }
    const listeners = []
    const stateRun = () => s.run && !s.captcha && !s.error
    return {
        run: () => stateRun(),
        observeRun: () => stateRun() && s.observe,
        prprRun: () => stateRun() && s.prpr,
        logRun: () => s.onlog,
        coop: {
            run: () => stateRun() && s.coop.run,
            host: () => s.coop.host,
            first: () => s.coop.first
        },
        auto_battle: () => stateRun() && s.auto_battle,
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
    }
})