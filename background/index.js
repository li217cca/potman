
var popConn = null, contentConn = null
const state = default_state

const preState = localStorage.getItem("options")
Object.assign(state, preState)
const refreshState = () => {
    if (popConn !== null) popConn.postMessage({type: "getState", state}) 
    if (contentConn !== null) contentConn.postMessage({type: "getState", state})
    localStorage.setItem("options", state)
}
const status = {}
chrome.runtime.onConnect.addListener(function(conn) {
    // var tab = conn.sender.tab

    conn.postMessage({type: "connSuccess"})
    conn.onMessage.addListener(function(event) {
        switch (event.type) {
            case "requireState": {
                conn.postMessage({type: "getState", state})
                break
            }
            case "setState": {
                Object.assign(state, event.state)
                refreshState()
                break
            }
            case "getStatus": {
                conn.postMessage({type: "status", status: status})
                break
            }
            case "status": {
                Object.assign(status, event.status)
                break
            }
            case "contentConn": {
                contentConn = conn
                break
            }
            case "popConn": {
                popConn = conn
                break
            }
            case "checkBattleKey": {
                if (contentConn) {
                    contentConn.postMessage(event)
                }
                break
            }
            case "copyRaid": {
                if (contentConn) {
                    contentConn.postMessage(event)
                }
                break
            }
            case "listenRaid": {
                if (contentConn) {
                    contentConn.postMessage(event)
                }
                break
            }
        }
    })
})
