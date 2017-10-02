
const moduleIds = {
    "dXRpbC9vYg==": [
        "12714651802a118e12b7f218d2733eda4408965a86a808ad6f61bdf01c4a8dbf",
        "7c486bcd0283f36059402adaf9ace031783f4b8e4afe22ece9ed421e4007ef44",
        "b08394ca1b72a8658361e641ee31f1d8479b9020f66fd8db66078c008e578f6c",
        "8aeb968c6033391acd38efe5dc0188ac86a3fa5d78a76c6ffc74052954c424fd",
        "d83c74b2ecc40421c7162fb839190104476f12334b044439f652ddef0f07103f",
        "1753d967d5787732bd5da19bfff8f1179aee68be9f3c14ec6963a445c5371f11"
    ]
};
// logger
function log(...args) {
    if (args.length < 1) return
    var time = new Date()
    console.info("[" + time.toLocaleString() + "]", ...args)
}
// throwError
function throwError(message) {
    throw new Error(message)
}

// OB reg
const ObserverRegister = (() => {
    log("observer register init")
    const checkFunctions = new Set()
    setInterval(() => {
        checkFunctions.forEach(callback => callback())
    }, 500)
    // const observer = new MutationObserver(mutations => checkFunctions.forEach(callback => callback()))
    // observer.observe(document.body, {childList: true, subtree: true, attributes: true, characterData: true, attributeFilter: ["class", "id"]})
    return {
        register: checkFunc => (checkFunctions.add(checkFunc), () => {
            log("delete func")
            checkFunctions.delete(checkFunc)
        })
    }
}) ().register
// wait for elemtnt to exist
const waitForElementToExist = (selector, callback, once) => {
    (!selector && throwError("No selector")), 
    ((!callback || !callback.call) && throwError("No callback provided"))
    const find = () => {
        if (!state.observeRun()) return
        const rs = $(selector + ":visible")
        if (rs.length > 0) {
            callback(rs)
            if (once) {
                log("unregister")
                unregister()
            }
        }
    }
    const unregister = ObserverRegister(find)
    setTimeout(find, 10)
    return unregister
}

const get_rect = function (handle) {
    handle instanceof jQuery || (handle = $(handle));// handle 是否存在JQ属性，否则再次选择
    // class
    var e, zoom = $(document.documentElement).css("zoom"),
        o = {
            x: 0x0,
            y: 0x0,
            w: 0x0,
            h: 0x0
        },
        parent = handle.parents();
    if (o.w = handle.innerWidth() * zoom,
            o.h = handle.innerHeight() * zoom,
        (0x0 == o.w || 0x0 == o.h) && ( // 判断 w, h 是非为0
            handle = handle.parent(),  // 取其父节点 w, h 值
                o.w = handle.innerWidth() * zoom, o.h = handle.innerHeight() * zoom),
            parent.is(document.body))
        for (var node = handle; node[0x0] != document.body; node = node.parent()) // 遍历父节点
            e = node.position(),
                o.y = o.y + e.top * zoom,
                o.x = o.x + e.left * zoom;
    return o
}
const pressByJquery = function (handle) {
    var rect = get_rect(handle);

    if (!(rect.y < 0x1 || rect.x < 0x1)) {
        var x = Math.round(rect.x + Math.random() * rect.w),
            y = Math.round(rect.y + Math.random() * rect.h),
            mouseup = new MouseEvent("mouseup", {
                view: window,
                bubbles: !0x0,
                clientX: x,
                clientY: y,
                cancelable: !0x0
            }),
            mousedown = new MouseEvent("mousedown", {
                view: window,
                bubbles: !0x0,
                clientX: x,
                clientY: y,
                cancelable: !0x0
            })
        0x0 != handle.length && (handle[0x0].dispatchEvent(mousedown), handle[0x0].dispatchEvent(mouseup))
    } else {
        console.info(rect.y, rect.x)
    }
}
const pressBySelector = function (className) { // click事件
    className = className+":last"
    var rect = get_rect(className);
    if (!(rect.y < 0x1 || rect.x < 0x1)) {
        var x = Math.round(rect.x + Math.random() * rect.w),
            y = Math.round(rect.y + Math.random() * rect.h),
            mouseup = new MouseEvent("mouseup", {
                view: window,
                bubbles: !0x0,
                clientX: x,
                clientY: y,
                cancelable: !0x0
            }),
            mousedown = new MouseEvent("mousedown", {
                view: window,
                bubbles: !0x0,
                clientX: x,
                clientY: y,
                cancelable: !0x0
            }),
            handle = $(className);
        0x0 != handle.length && (handle[0x0].dispatchEvent(mousedown), handle[0x0].dispatchEvent(mouseup))
    } else {
        console.info(rect.y, rect.x)
    }
}

const newSandbox = (() => {
    const getResourceUrl = (name) => chrome.extension.getURL('content/' + name)

    
    log("init external sandbox")
    // init external sandbox
    const sandboxParent = document.createElement("div")

    document.documentElement.appendChild(sandboxParent)
    const scriptSandbox = document.createElement("iframe")
    scriptSandbox.id = "myss"
    scriptSandbox.style = "display: none"
    sandboxParent.createShadowRoot().appendChild(scriptSandbox);

    log("init exterlan channel")
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
            externalChannel.port1.onmessage = onWindowMessage // inject/onWindowMessage
            scriptSandbox.contentWindow.postMessage({
                type: "pmInit",
                bhstatic: getResourceUrl("bhstatic.json"),
                moduleIds: Object.keys(moduleIds)
            }, "*", [externalChannel.port2])
        })
    })
    const sendExternalMessage = msg => {
        log("sanbox sendExternalMessage", msg)
        if (!externalChannel || !isChannelReady) {
            pendingExternalMessages.push(msg);
            return;
        }
        externalChannel.port1.postMessage(msg);
    }
    return {
        finishChannelSetup: () => {
            log("sanbox finishChannelSetup")
            doPopup("沙盒加载成功")
            isChannelReady = true
            for (var i = 0, l = pendingExternalMessages.length; i < l; i++)
                externalChannel.port1.postMessage(pendingExternalMessages[i]);
            pendingExternalMessages.length = 0;
            _loadShaScript(window);
        },
        sendExternalMessage: sendExternalMessage
    }
})
const sandbox = newSandbox()

var pops = null, pendingPopup = []
waitForElementToExist("body", () => {
    pops = document.createElement("div")
    pops.style.position = "fixed"
    pops.style.left = "75px"
    pops.style.color = "#FEF"
    pops.style.zIndex = 999999
    pops.style.fontSize = "20px"
    pops.style.borderRadius = "4px"
    pops.style.backgroundColor = "#333"
    pops.style.opacity = 0.8
    document.body.appendChild(pops)
    pendingPopup.forEach(f => f())
    pendingPopup = []
}, true)
const doPopup = msg => {
    const func = () => {
        const div = document.createElement("div")
        div.innerHTML = msg.toString()
        pops.appendChild(div)
        setTimeout(() => {
            pops.removeChild(div)
        }, 3000)
    }
    if (!!pops) {
        func()
    } else pendingPopup.push(func)
}