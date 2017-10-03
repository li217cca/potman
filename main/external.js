/**
 * Created by cifer on 2017/9/18.
 */
"use strict";
const _loadExternalScript = function (window) {
    "use strict";
    var context = window.parent;
    var port = null;
    var channelSetup = null;
    var bhstatic = "//127.0.0.1/bhstatic";
    var console = window["console"];
    var moduleIds = [];
    var pendingMessages = [];
    var isShutdown = false;
    var sentHeartbeat = false;
    channelSetup = function (evt) {
        if (evt.data.type !== "EXTERNAL_INIT")
            return;
        bhstatic = evt.data.bhstatic;
        moduleIds = evt.data.moduleIds;
        port = evt.ports[0];
        port.onmessage = onWindowMessage;
        port.postMessage({ type: "EXTERNAL_SUCCESS" })
        window.removeEventListener("message", channelSetup, true);
        for (var i = 0, l = pendingMessages.length; i < l; i++)
            port.postMessage(pendingMessages[i]);
        pendingMessages.length = 0
        evt.preventDefault()
        evt.stopImmediatePropagation()
        log("channel setup..")
    }
    window.addEventListener("message", channelSetup, true);
    function log(...args) {
        sendMessage({
            type: "EXTERNAL_LOG",
            args: args
        });
    }
    
    function sendMessage(msg) {
        if (port)
            port.postMessage(msg);
        else
            pendingMessages.push(msg);
    }
    ;

    var WebSocket_original = context.WebSocket;
    // Intercept web socket construction so we can snoop on messages
    // This allows us to find out when other players do stuff in raids
    var newWebSocket = function WebSocket() {
        var gluedArguments = Array.prototype.concat.apply([null], arguments);
        var boundConstructor = Function.prototype.bind.apply(WebSocket_original, gluedArguments);
        // sendMessage({ type: 'webSocketCreated' });
        var result = new boundConstructor();
        result.addEventListener("message", function (evt) {
            sendMessage({ type: 'WEBSOCKET_RECEIVED', data: evt.data });
        }, true);
        return result;
    };
    for (var k in WebSocket_original) {
        if (!WebSocket_original.hasOwnProperty(k))
            continue;
        var v = WebSocket_original[k];
        // console.log(k, v);
        newWebSocket[k] = v;
    }
    newWebSocket.toString = function toString() {
        return WebSocket_original.toString();
    };
    newWebSocket.prototype = WebSocket_original.prototype;
    newWebSocket.prototype.constructor = newWebSocket;
    context.WebSocket = newWebSocket;

    var XHR = context.XMLHttpRequest;
    var open_original = XHR.prototype.open;
    var send_original = XHR.prototype.send;
    var addEventListener_original = XHR.prototype.addEventListener;
    var setRequestHeader_original = XHR.prototype.setRequestHeader;
    var doResultFiltering = true;
    var xhrStateTable = new WeakMap();
    function getXhrState(xhr) {
        var result = xhrStateTable.get(xhr);
        if (!result) {
            result = {};
            xhrStateTable.set(xhr, result);
        }
        if (!result.readyStateListeners)
            result.readyStateListeners = [];
        return result;
    }
    ;
    var validTableKeys = [1002, 1003, 4001];
    function tryPreprocessXhr(xhr, state) {
        if (state.url.indexOf(atob("L29iLw==")) >= 0) { // /ob/
            var obj = JSON.parse(state.data);
            if (obj.c[4001] && !sentHeartbeat) {
                for (var key in obj.c) {
                    if (validTableKeys.indexOf(Number(key)) < 0) {
                        log("Removing " + key + " from ob");
                        delete obj.c[key];
                    }
                }
                state.data = JSON.stringify(obj);
                sentHeartbeat = true;
            }
            else {
                log("Squelched");
                state.url = bhstatic;
                state.noHeaders = true;
                open_original.call(xhr, state.method, state.url, state.async);
            }
        }
        else if (state.url.indexOf(atob("Z2MvZ2M=")) >= 0) { // gc/gc
            var obj = JSON.parse(state.data);
            for (var key in obj.c) {
                if (validTableKeys.indexOf(Number(key)) < 0) {
                    log("Removing " + key + " from gc/gc");
                    delete obj.c[key];
                }
            }
            state.data = JSON.stringify(obj);
        }
        else if (state.url.indexOf(atob("ZXJyb3IvanM=")) >= 0) { // error/js
            log("Squelched");
            state.url = bhstatic;
            state.noHeaders = true;
            open_original.call(xhr, state.method, state.url, state.async);
        }
    }
    ;
    var customOnReadyStateChange = function () {
        try {
            var state = getXhrState(this);
            if (this.readyState == XHR.HEADERS_RECEIVED)
                state.headersReceived = performance.now();
            else if ((this.readyState == XHR.LOADING) && (state.loadingStarted <= 0))
                state.loadingStarted = performance.now();
            else if (this.readyState == XHR.DONE) {
                // HACK: This *should* always happen before 'load' is fired,
                //  allowing us to replace the result
                state.onComplete.call(this, state);
            }
        }
        catch (exc) {
            log(exc);
        }
        try {
            if (doResultFiltering) {
                for (var i = 0, l = state.readyStateListeners.length; i < l; i++) {
                    try {
                        state.readyStateListeners[i].apply(this, arguments);
                    }
                    catch (exc) {
                        log(exc);
                    }
                }
            }
        }
        catch (exc) {
            log(exc);
        }
    };
    function customOnComplete(state) {
        if (state.done)
            return;
        state.done = performance.now();
        state.result = this.response || this.responseText;
        state.response = this.response;
        state.responseType = this.responseType;
        if ((state.responseType === "") || (state.responseType === "text"))
            state.responseText = this.responseText;
        state.status = this.status;
        state.statusText = this.statusText;
        state.contentType = this.getResponseHeader('content-type');
        if (state.noHeaders) {
            var grh_original = this.getResponseHeader;
            var grh = function () {
                return;
            };
            grh.toString = function () {
                return grh_original.toString();
            };
            Object.defineProperty(this, "getResponseHeader", { value: grh });
        }
        if (state.resultFilter) {
            var didFilter = state.resultFilter.call(this, state);
            if (didFilter) {
                Object.defineProperty(this, "response", { value: state.response });
                Object.defineProperty(this, "responseText", { value: state.responseText });
                Object.defineProperty(this, "responseType", { value: state.responseType });
                Object.defineProperty(this, "status", { value: state.status });
                Object.defineProperty(this, "statusText", { value: state.statusText });
            }
        }
        afterAjax(state);
    }
    
    function pickResultFilter(state) {
        // if ((state.url.indexOf("ability_result.json") >= 0) ||
        //     (state.url.indexOf("summon_result.json") >= 0) ||
        //     (state.url.indexOf("normal_attack_result.json") >= 0)) {
        //     if (resignedToBloodshed)
        //         return filter_actionResult;
        //     else if (flipsville)
        //         return filter_drop;
        // }
        // if (!resignedToBloodshed)
        //     return null;
        // if (state.url.indexOf("start.json") >= 0) {
        //     return filter_start;
        // }
        // if ((state.url.indexOf("/condition/") >= 0) &&
        //     (state.url.indexOf(".json") >= 0)) {
        //     return filter_conditionList;
        // }
        return null;
    }
    XHR.prototype.open = function open(method, url, async, user, password) {
        try {
            var state = getXhrState(this);
            state.method = method;
            state.url = url;
            state.async = async;
            state.opened = performance.now();
            state.loadingStarted = 0;
            state.headersReceived = 0;
            state.custom = false;
            addEventListener_original.call(this, "readystatechange", customOnReadyStateChange, false);
        }
        catch (exc) {
            log(exc);
        }
        var result = open_original.apply(this, arguments);
        return result;
    };
    XHR.prototype.addEventListener = function addEventListener(eventName, listener, useCapture) {
        try {
            var state = getXhrState(this);
            if (doResultFiltering &&
                (eventName === "readystatechange")) {
                state.readyStateListeners.push(listener);
                // console.log("xhr.addEventListener captured", eventName, listener);
                return true;
            }
        }
        catch (exc) {
            log(exc);
        }
        var result = addEventListener_original.apply(this, arguments);
        return result;
    };
    XHR.prototype.send = function send(data) {
        try {
            var state = getXhrState(this);
            state.sent = performance.now();
            state.data = data;
            state.onComplete = customOnComplete;
            state.resultFilter = pickResultFilter(state);
            tryPreprocessXhr(this, state);
            beforeAjax(state.url, state.data, this, context.Game.userId);
        }
        catch (exc) {
            log(exc);
        }
        if (state.custom) {
            try {
                state.sendResult = send_original.call(this, state.data);
            }
            catch (exc) {
                log(exc);
            }
        }
        else {
            state.sendResult = send_original.call(this, state.data);
        }
        try {
            if (!state.async)
                customOnComplete.call(this, state);
        }
        catch (exc) {
            log(exc);
        }
        return state.sendResult;
    };
    XHR.prototype.open.toString = function toString() {
        return open_original.toString();
    };
    XHR.prototype.setRequestHeader.toString = function toString() {
        return setRequestHeader_original.toString();
    };
    XHR.prototype.addEventListener.toString = function toString() {
        return addEventListener_original.toString();
    };
    XHR.prototype.send.toString = function toString() {
        return send_original.toString();
    };
    
    function generateClick(target, asClick) {
        if (isShutdown)
            return;
        context.$(target).trigger(asClick ? "click" : "tap");
    }
    function manufactureEvent(currentTarget, target) {
        var evt = Object.create(null);
        evt.type = "tap";
        // FIXME
        evt.x = (Math.random() * 256) | 0;
        evt.y = (Math.random() * 256) | 0;
        evt.delegateTarget = context.document.querySelector("div.contents");
        evt.currentTarget = currentTarget;
        evt.target = target;
        evt.timestamp = Date.now();
        return evt;
    }
    function onWindowMessage(evt) {
        if (!evt.data.type)
            return;
        try {
            switch (evt.data.type) {
                case "click":
                    if (isShutdown)
                        return;
                    var name = evt.data.name;
                    var token = evt.data.token;
                    var tokenAttribute = evt.data.tokenAttribute;
                    var element = context.document.querySelector(name + "[" + tokenAttribute + "='" + token + "']");
                    if (element)
                        generateClick(element, evt.data.asClick);
                    return;
                case "compatibilityShutdown":
                    doShutdown();
                    return;
                case "DO_AJAX":
                    log("onWindowMessage doAjax", evt.data)
                    doAjaxInternal(evt.data);
                    return;
                case "doPopup":
                    var popupData = evt.data.data;
                    popupData.className = null;
                    popupData.okCallBackName = "popRemove";
                    popupData.cancelCallBackName = null;
                    popupData.exceptionFlag = false;
                    context.Game.view.trigger("popup_error", { data: popupData });
                    return;
                case "getUserIdAndTabId":
                    tryGetUserIdAndTabId(evt.data.token, evt.data.tabId);
                    return;
                case "maskShadow":
                    var elts = context.document.querySelectorAll(evt.data.selector);
                    for (var i = 0, l = elts.length | 0; i < l; i++) {
                        var elt = elts[i];
                        if (!elt.shadowRoot)
                            continue;
                        Object.defineProperty(elt, "shadowRoot", { value: null, writable: false, configurable: false, enumerable: true });
                    }
                    return;
            }
        }
        catch (exc) {
            sendMessage({
                type: 'ERROR',
                stack: exc.stack
            });
        }
    }
    ;
    function doAjaxInternal(evtData) {
        if (isShutdown)
            return;
        var jquery = context["$"];
        if (!jquery) {
            setTimeout(function () {
                doAjaxInternal(evtData);
            }, 500);
            return;
        }
        var url = evtData.url;
        var token = evtData.token;
        var data = evtData.data;
        if (!token)
            log("Invalid ajax request", evtData);
        var options = {
            cache: false,
            global: false
        };
        if (data) {
            options.data = data;
            options.method = "POST";
        }

        jquery.ajax(url, options).then(resp => {
            sendMessage({ type: 'DO_AJAX_RESULT', url: url, token: token, result: resp, error: null, failed: false });
        })
    }
    ;
    function beforeAjax(url, requestData, xhr, uid) {
        if (isShutdown)
            return;
        sendMessage({ type: 'AJAX_BEGIN', url: url, requestData: requestData, uid });
    }
    ;
    function afterAjax(state) {
        if (isShutdown)
            return;
        // HACK: Don't forward response data for non-json bodies.
        // Otherwise, we end up sending a LOT of data over the message channel,
        //  which causes it to be cloned.
        var responseData = state.result;
        if (state.contentType &&
            (state.contentType.indexOf("application/json") < 0) &&
            (state.url.indexOf(".json") < 0)) {
            responseData = null;
        }
        else {
            // log("done", url, contentType, requestData);
        }
        sendMessage({
            type: 'AJAX_COMPLETE',
            url: state.url,
            requestData: state.data,
            responseData: responseData,
            contentType: state.contentType,
            status: state.status,
            duration: state.done - state.opened,
            delay: state.done - (state.loadingStarted || state.headersReceived || state.sent),
            uid: context.Game.userId
        });
    }
    ;
    function tryGetUserIdAndTabId(token, tabId) {
        if (!context.Game) {
            setTimeout(function () { tryGetUserIdAndTabId(token, tabId); }, 100);
            return;
        }
        sendMessage({
            type: "userIdAndTabId",
            token: token,
            uid: context.Game.userId,
            tabId: tabId
        });
    }

    function doShutdown() {
        isShutdown = true;
        try {
            context.WebSocket = WebSocket_original;
            XHR.prototype.open = open_original;
            XHR.prototype.send = send_original;
            XHR.prototype.addEventListener = addEventListener_original;
            XHR.prototype.setRequestHeader = setRequestHeader_original;
        }
        catch (exc) {
            log("Error during shutdown", exc);
        }
        sendMessage({
            type: "shutdownOk"
        })
    }
}
//# sourceMappingURL=external.js.map