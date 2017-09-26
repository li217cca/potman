/**
 * Created by cifer on 2017/9/17.
 */


var state = {}
var button = document.getElementsByTagName("button")[0]

var conn = chrome.runtime.connect()
conn.onMessage.addListener(function (event) {
    Object.assign(state, event)
    if (event.run) {
        button.innerHTML = "停止"
    } else {
        button.innerHTML = "运行"
    }
})

function onclick() {
    conn.postMessage("click_run")
}