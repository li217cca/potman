/**
 * Created by cifer on 2017/9/17.
 */

// chrome.browserAction.setIcon("icon-on.png")

chrome.runtime.onConnect.addListener(function(port) {
    var tab = port.sender.tab

    var state = {
        run: false,
        captcha: false,
        speed: 0.5,
        listen: {
            repeat: true,
            attack: true,
            skill: false,
            result: true,
            coop: true,
            prepare: true,
            start: true
        }
    }

    port.onMessage.addListener(function(event) {

    })
    port.postMessage(state)
})

