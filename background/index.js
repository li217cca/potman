
const state = default_state
const str = localStorage.getItem("options")
console.log( "state", state, str)
const preState = str.length > 0 ? JSON.parse(str) : {}

Object.assign(state, preState)
const conns = []
const superPostMessage = (msg) => {
    conns.forEach(conn => {
        conn.postMessage(msg)
    })
}
const refreshState = () => {
    superPostMessage({type: evt.GET_STATE, state})
    localStorage.setItem("options", JSON.stringify(state))
}

chrome.runtime.onConnect.addListener(function(conn) {
    console.log("new conn from", conn)
    conns.push(conn)
    conn.postMessage({type: evt.CONN_SUCCESS})
    conn.onMessage.addListener(function(event) {
        switch (event.type) {
            case evt.REQUIRE_STATE: {
                conn.postMessage({type: evt.GET_STATE, state: state})
                break
            }
            case evt.SET_STATE: {
                Object.assign(state, event.state)
                refreshState()
                break
            }
            default: {
                superPostMessage(event)
            }
        }
    })
})
