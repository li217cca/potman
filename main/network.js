

const _superPostMessage = (msg) => {
    _conn.postMessage(msg)
    _sandbox.sendExternalMessage(msg)
}
const _superOnMessageList = []
const _superOnMessage = (type, callback) => {
    _superOnMessageList.push({
        type: type,
        callback: callback
    })
}

const _superListener = (event) => {
    _superOnMessageList.every(handle => {
        if (handle.type === event.type) {
            handle.callback(event)
            return false
        }
        return true
    })
}

// listen message
_superOnMessage(evt.CONN_SUCCESS, () => {
    _myLog("background connection success!")
    _superPostMessage({type: evt.REQUIRE_STATE})
})
_superOnMessage(evt.GET_STATE, event => {
    _myLog("get state from background")
    modelUpdate(event.state)
})
_superOnMessage(evt.GET_RAID_ID_FROM_LISTEN, event => {
    _myLog("get raid id from copy", event.raid_id)
})
_superOnMessage(evt.GET_RAID_ID_FROM_LISTEN, event => {
    _myLog("get raid id from listen", event.raid_id)
})
_superOnMessage(evt.EXTERNAL_SUCCESS, () => {
    _sandbox.finishChannelSetup()
})
_superOnMessage(evt.EXTERNAL_LOG, event => {
    _myLog("EXTERNAL:", ...event.args)
})
_superOnMessage(evt.AJAX_BEGIN, event => {
    // onAjaxBegin(event.url, event.requestData, event.uid);
})
// TODO..
_superOnMessage(evt.AJAX_COMPLETE, event => {
    _ajaxCompleteListeners.forEach(cb => cb(event)) 
})
_superOnMessage(evt.DO_AJAX_RESULT, event => {
    var callback = _ajaxCallbacks[event.token];
    delete _ajaxCallbacks[event.token];
    callback(event.result, event.error, event.url);
})
_superOnMessage(evt.ERROR, event => {
    _myLog("ERROR in", event)
})
_superOnMessage(evt.WEBSOCKET_RECEIVED, event => {
    _myLog("websocket message received", event)
    _websocketMessageListeners.forEach(cb => cb(event))
})

// listeners
var _nextAjaxToken = 0
const _ajaxCallbacks = {}
const _doClientAjax = async (url, data) => {
    await modelWaitRun()

    return new Promise(resolve => {
        const token = ++_nextAjaxToken
        _ajaxCallbacks[token] = resolve
        _superPostMessage({type: evt.DO_AJAX, token: token, data: data, url: url})
    })
}
const _websocketMessageListeners = new Set()
const _listenWebsocketMessage = (callback, once = true) => {
    const cb = (data) => {
        _myLog("call listen websocket message cb")
        if (callback(data) && once) {
            _websocketMessageListeners.delete(cb)
        }
    }
    _websocketMessageListeners.add(cb)
}
const _ajaxCompleteListeners = new Set()
const _listenAjaxComplete = (callback, once = true) => {
    const cb = (data) => {
        if (callback(data) && once) {
            _ajaxCompleteListeners.delete(cb)
        }
    }
    _ajaxCompleteListeners.add(cb)
}


// connection to background
const _conn = chrome.runtime.connect()
_conn.onMessage.addListener(_superListener)

const _sandboxConstructor = () => {
    const moduleIds = {
        "dXRpbC9vYg==": [
            "12714651802a118e12b7f218d2733eda4408965a86a808ad6f61bdf01c4a8dbf",
            "7c486bcd0283f36059402adaf9ace031783f4b8e4afe22ece9ed421e4007ef44",
            "b08394ca1b72a8658361e641ee31f1d8479b9020f66fd8db66078c008e578f6c",
            "8aeb968c6033391acd38efe5dc0188ac86a3fa5d78a76c6ffc74052954c424fd",
            "d83c74b2ecc40421c7162fb839190104476f12334b044439f652ddef0f07103f",
            "1753d967d5787732bd5da19bfff8f1179aee68be9f3c14ec6963a445c5371f11"
        ]
    }
    const getResourceUrl = (name) => chrome.extension.getURL('content/' + name)

    
    // init external sandbox
    const sandboxParent = document.createElement("div")

    document.documentElement.appendChild(sandboxParent)
    const scriptSandbox = document.createElement("iframe")
    scriptSandbox.id = "myss"
    scriptSandbox.style = "display: none"
    sandboxParent.createShadowRoot().appendChild(scriptSandbox);

    // init exterlan channel
    const loadScriptInSandbox = (constructor, callback) => {
        const parent = scriptSandbox.contentDocument.documentElement;
        const elt = document.createElement("script");
        elt.type = "text/javascript";
        const js = '"use strict";\r\n(' + constructor.toString() + ')(this);';      
        
        elt.textContent = js;
        parent.appendChild(elt);
        callback();
        // FIXME: ?
        // window.setTimeout(function () {
        //     parent.removeChild(elt);
        // }, 1);
    }
    var externalChannel = null, isChannelReady = false, pendingExternalMessages = []
    loadScriptInSandbox(_loadShaScript, function () {
        loadScriptInSandbox(_loadExternalScript, function () {
            externalChannel = new MessageChannel()
            externalChannel.port1.onmessage = event => _superListener(event.data)
            scriptSandbox.contentWindow.postMessage({
                type: evt.EXTERNAL_INIT,
                bhstatic: getResourceUrl("bhstatic.json"),
                moduleIds: Object.keys(moduleIds)
            }, "*", [externalChannel.port2])
        })
    })
    const sendExternalMessage = msg => {
        if (!externalChannel || !isChannelReady) {
            pendingExternalMessages.push(msg);
            return;
        }
        externalChannel.port1.postMessage(msg);
    }
    return {
        finishChannelSetup: () => {
            _popup.popup("沙盒加载成功")
            isChannelReady = true
            for (var i = 0, l = pendingExternalMessages.length; i < l; i++)
                externalChannel.port1.postMessage(pendingExternalMessages[i]);
            pendingExternalMessages.length = 0;
            _loadShaScript(window);
        },
        sendExternalMessage: sendExternalMessage
    }
}

const _sandbox = _sandboxConstructor()
