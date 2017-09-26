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
        if (evt.data.type !== "pmInit")
            return;
        bhstatic = evt.data.bhstatic;
        moduleIds = evt.data.moduleIds;
        port = evt.ports[0];
        port.onmessage = onWindowMessage;
        window.removeEventListener("message", channelSetup, true);
        for (var i = 0, l = pendingMessages.length; i < l; i++)
            port.postMessage(pendingMessages[i]);
        pendingMessages.length = 0;
        evt.preventDefault();
        evt.stopImmediatePropagation();
        log("External channel established");
    }
    window.addEventListener("message", channelSetup, true);
    function log(...args) {
        sendMessage({
            type: "externalLog",
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
        sendMessage({ type: 'webSocketCreated' });
        var result = new boundConstructor();
        result.addEventListener("message", function (evt) {
            sendMessage({ type: 'webSocketMessageReceived', data: evt.data });
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
    
    var document_addEventListener = context.Document.prototype.addEventListener;
    var element_addEventListener = context.Element.prototype.addEventListener;
    var filterMouseEvents = false;
    var lastMouseDownEvent = null;
    var lastMouseDownEventIsFiltered = false;
    var snoopedEvents = [
        "mousedown", "mousemove", "mouseup", "click",
        "touchstart", "touchend", "touchmove", "touchcancel"
    ];
    var nonTransferableProperties = [
        "isTrusted", "path", "type", "which",
        "button", "buttons", "timeStamp", "returnValue",
        "eventPhase", "defaultPrevented",
        "target", "relatedTarget", "fromElement", "toElement"
    ];
    var swipeSuppressClasses = ["lis-ability"];
    function findElementAncestorWithClass(elt, classNames) {
        while (elt) {
            for (var i = 0, l = classNames.length; i < l; i++) {
                var className = classNames[i];
                if (elt.className.indexOf(className) >= 0)
                    return elt;
            }
            elt = elt.parentElement;
        }
        return null;
    }
    ;
    function transferProperty(src, dest, name) {
        if (nonTransferableProperties.indexOf(name) >= 0)
            return;
        Object.defineProperty(dest, name, {
            value: src[name]
        });
    }
    ;
    function looseElementComparison(a, b, classNames) {
        var aa = findElementAncestorWithClass(a, classNames);
        var ba = findElementAncestorWithClass(b, classNames);
        return aa && ba && (aa == ba);
    }
    ;
    function filteredMouseEventProxyHandler(originalEvent) {
        this.originalEvent = originalEvent;
        /*
         for (var k in lastMouseDownEvent)
         transferProperty(lastMouseDownEvent, evt, k);

         Object.defineProperty(evt, "movementX", { value: 0 });
         Object.defineProperty(evt, "movementY", { value: 0 });
         */
    }
    ;
    filteredMouseEventProxyHandler.prototype.get = function (target, property, receiver) {
        var result = target[property];
        switch (typeof (result)) {
            case "function":
                return result;
        }
        if (nonTransferableProperties.indexOf(property) < 0)
            result = this.originalEvent[property];
        return result;
    };
    function wrapMouseEventListener(type, listener) {
        if (!listener.apply) {
            // wtf cygames
            return listener;
        }
        switch (type) {
            case "mousedown":
                return function filterMouseDown(evt) {
                    if (filterMouseEvents)
                        try {
                            lastMouseDownEvent = evt;
                            lastMouseDownEventIsFiltered = !!findElementAncestorWithClass(evt.target, swipeSuppressClasses);
                        }
                        catch (exc) {
                            log(exc);
                        }
                    return listener.apply(this, arguments);
                };
            case "mousemove":
                return function filterMouseMove(evt) {
                    if (filterMouseEvents)
                        try {
                            if ((evt.buttons !== 0) &&
                                lastMouseDownEvent &&
                                (lastMouseDownEventIsFiltered &&
                                findElementAncestorWithClass(evt.target, swipeSuppressClasses))) {
                                // log("filtered mousemove");
                                // TODO: Instead, modify the coordinates and only update them if the event
                                //  leaves the button, so mouse-out works as expected
                                return;
                            }
                        }
                        catch (exc) {
                            log(exc);
                        }
                    return listener.apply(this, arguments);
                };
            case "mouseup":
                return function filterMouseUp(evt) {
                    if (filterMouseEvents)
                        try {
                            if (lastMouseDownEvent &&
                                looseElementComparison(evt.target, lastMouseDownEvent.target, swipeSuppressClasses) &&
                                (lastMouseDownEventIsFiltered &&
                                findElementAncestorWithClass(evt.target, swipeSuppressClasses))) {
                                // log("filtered mouseup");
                                evt = new Proxy(evt, new filteredMouseEventProxyHandler(lastMouseDownEvent));
                            }
                        }
                        catch (exc) {
                            log(exc);
                        }
                    return listener.call(this, evt);
                };
        }
        return listener;
    }
    ;
    context.Document.prototype.addEventListener = function (type, _listener, options) {
        var listener = _listener;
        try {
            if (snoopedEvents.indexOf(type) >= 0)
                listener = wrapMouseEventListener(type, _listener);
        }
        catch (exc) {
        }
        var result = document_addEventListener.call(this, type, listener, options);
        // log("document", type, listener);
        return result;
    };
    context.Element.prototype.addEventListener = function (type, _listener, options) {
        var listener = _listener;
        try {
            if (snoopedEvents.indexOf(type) >= 0)
                listener = wrapMouseEventListener(type, _listener);
        }
        catch (exc) {
        }
        var result = element_addEventListener.call(this, type, listener, options);
        // log(name, type, listener);
        return result;
    };
    context.Document.prototype.addEventListener.toString = function () {
        return document_addEventListener.toString();
    };
    context.Element.prototype.addEventListener.toString = function () {
        return element_addEventListener.toString();
    };
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
    ;
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
                case "trySelectSummon":
                    if (isShutdown)
                        return;
                    currentRaidView.CommandChangeSummon();
                    var pos = evt.data.pos;
                    var elt = context.document.querySelector('div.lis-summon[pos="' + pos + '"]');
                    if (!elt)
                        return;
                    var evt = manufactureEvent(elt, elt.querySelector("img"));
                    currentRaidView.popShowSummon(evt);
                    return;
                case "tryClickSummonUseButton":
                    if (isShutdown)
                        return;
                    var elt = context.document.querySelector('div.btn-usual-ok.btn-summon-use');
                    if (!elt)
                        return;
                    var evt = manufactureEvent(elt, elt);
                    currentRaidView.AddSummonAttackQueue(evt);
                    return;
                case "compatibilityShutdown":
                    doShutdown();
                    return;
                case "doAjax":
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
                type: 'error',
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
        var callback = evtData.callback;
        if (!callback && !token)
            log("Invalid ajax request", evtData);
        var options = {
            cache: false,
            global: false
        };
        if (data) {
            options.data = data;
            options.method = "POST";
        }
        options.success = function (result) {
            if (callback)
                callback(url, result, null, false);
            else if (token)
                sendMessage({ type: 'doAjaxResult', url: url, token: token, result: result, error: null, failed: false });
        };
        options.error = function (jqXHR, exception) {
            if (callback)
                callback(url, null, jqXHR.status + " -- " + String(exception), true);
            else if (token)
                sendMessage({ type: 'doAjaxResult', url: url, token: token, error: jqXHR.status + " -- " + String(exception), failed: true });
        };
        jquery.ajax(url, options);
    }
    ;
    function beforeAjax(url, requestData, xhr, uid) {
        if (isShutdown)
            return;
        sendMessage({ type: 'ajaxBegin', url: url, requestData: requestData, uid });
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
            type: 'ajaxComplete',
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
    ;
    var moduleHooks = {};
    moduleHooks["view/raid/setup"] = function (name) {
        var vrs = context.require("view/raid/setup");
        hookRaidView(vrs);
    };
    var currentRaidView = null;
    var original_initialize_raidView;
    function hookRaidView(ctor) {
        var p = ctor.prototype;
        original_initialize_raidView = p.initialize;
        p.initialize = function () {
            var result = original_initialize_raidView.apply(this, arguments);
            currentRaidView = result || this;
            return result;
        };
        p.initialize.toString = function () {
            return original_initialize_raidView.toString();
        };
    }
    ;
    var original_popShow, original_popClose, original_onPushOk;
    var isAutoCloseInProgress = false;
    var abortAutoClose = null;
    function doAutoClose(a, b) {
        isAutoCloseInProgress = true;
        // log("Auto-closing popup");
        var mask;
        if (this.options.maskSubMenu)
            mask = context.document.querySelector("div.mask_submenu");
        else
            mask = context.document.querySelector("div.mask");
        mask.style.display = "none";
        var elt = this.el.querySelector("div");
        elt.className += " auto-hiding";
        var footer = elt.querySelector(".prt-popup-footer");
        if (footer)
            footer.style.display = "none";
        var body = elt.querySelector(".prt-popup-body");
        if (body)
            body.style.paddingBottom = "20px";
        var btn = context.$(elt).find(".btn-usual-ok");
        var startedWhen = performance.now();
        var minimumWait = 350;
        var maximumWait = 1750;
        var holdDuration = ((elt.innerHTML.trim().length * 0.225) +
        (elt.textContent.trim().length * 6) +
        minimumWait);
        if (holdDuration > maximumWait)
            holdDuration = maximumWait;
        if (this.options.className === "pop-trialbattle-notice")
            holdDuration = 250;
        var fadeDuration = 150;
        var fadeInterval;
        abortAutoClose = function () {
            abortAutoClose = null;
            isAutoCloseInProgress = false;
            window.clearInterval(fadeInterval);
        };
        var completeAutoClose = (function () {
            // FIXME: Why???
            btn.trigger("tap");
            elt.style.opacity = "0.0";
            elt.style.pointerEvents = "none";
            elt.className = elt.className.replace("pop-show", "pop-hide");
            elt.style.display = "none";
            abortAutoClose = null;
            isAutoCloseInProgress = false;
            window.clearInterval(fadeInterval);
            fadeInterval = null;
        }).bind(this);
        elt.addEventListener("click", completeAutoClose, true);
        var onFadeTick = (function () {
            try {
                var elapsed = performance.now() - startedWhen;
                var opacity = 1.0;
                if (elapsed <= holdDuration) {
                }
                else {
                    elapsed -= holdDuration;
                    opacity = Math.max(1.0 - (elapsed / fadeDuration), 0);
                    if (elapsed > fadeDuration)
                        completeAutoClose();
                }
                elt.style.opacity = opacity.toFixed(3);
            }
            catch (exc) {
                log(exc);
            }
        }).bind(this);
        fadeInterval = window.setInterval(onFadeTick, 33);
    }
    ;
    function hook_popShow(a, b) {
        try {
            // HACK: Kill the previous auto-closing popup first.
            if (abortAutoClose) {
                // log("An auto-close is in progress, making room for new popup");
                abortAutoClose();
            }
        }
        catch (exc) {
            log(exc);
        }
        var result = original_popShow.apply(this, arguments)
    }
    ;
    function hook_popClose() {
        isAutoCloseInProgress = false;
        return original_popClose.apply(this, arguments);
    }
    ;
    function hook_onPushOk() {
        isAutoCloseInProgress = false;
        return original_onPushOk.apply(this, arguments);
    }
    ;
    var actualDefine = undefined;
    var anonymousModule = null;
    function maybeHashModule(name, body) {
        if (!name)
            return;
        var moduleId = btoa(name.trim().toLowerCase());
        if (moduleIds.indexOf(moduleId) < 0)
            return;
        var hasher = new window.jsSHA("SHA-256", "TEXT");
        hasher.update(body);
        var hash = hasher.getHash("HEX");
        sendMessage({
            type: "moduleLoaded",
            id: moduleId,
            hash: hash
        });
    }
    ;
    var hook_onResourceLoad = function (context, map, depArray) {
        try {
            var name = map.name;
            var hook = moduleHooks[name];
            if (hook)
                hook(name);
        }
        catch (exc) {
        }
    };
    hook_onResourceLoad.toString = function () {
        return "function () {}";
    };
    var installRequireHook = function () {
        var rjs = context.requirejs;
        if (rjs.onResourceLoad)
            return;
        Object.defineProperty(rjs, "onResourceLoad", {
            enumerable: false,
            value: hook_onResourceLoad
        });
    };
    function processObjectModuleDefinition(name, dict) {
        var body = JSON.stringify(dict);
        maybeHashModule(name, body);
    }
    ;
    function processDependencyResolve(arr) {
    }
    ;
    function processFunctionModuleDefinition(name, fn) {
        var body = fn.toString();
        maybeHashModule(name, body);
    }
    ;
    function processModuleDefinition(args) {
        switch (args.length) {
            case 1:
            {
                var arg = args[0];
                var ta = typeof (arg);
                if (ta === "object") {
                    if (Array.isArray(arg))
                        return processDependencyResolve(arg);
                    else
                        return processObjectModuleDefinition(null, arg);
                }
                else if (ta === "function") {
                    return processFunctionModuleDefinition(null, arg);
                }
            }
                break;
            case 2:
            {
                var arg0 = args[0];
                var arg1 = args[1];
                if (Array.isArray(arg0)) {
                    processDependencyResolve(arg0);
                    arg0 = anonymousModule;
                }
                if (typeof (arg1) === "function")
                    return processFunctionModuleDefinition(arg0, arg1);
                else if (typeof (arg1) === "object")
                    return processObjectModuleDefinition(arg0, arg1);
            }
                break;
            case 3:
            {
                var arg0 = args[0];
                var arg1 = args[1];
                var arg2 = args[2];
                if (!arg0)
                    arg0 = anonymousModule;
                if (Array.isArray(arg1))
                    processDependencyResolve(arg1);
                if (typeof (arg2) === "function")
                    return processFunctionModuleDefinition(arg0, arg2);
                else if (typeof (arg2) === "object")
                    return processObjectModuleDefinition(arg0, arg2);
            }
                break;
        }
    }
    ;
    var define = function define() {
        installRequireHook();
        var result = actualDefine.apply(this, arguments);
        try {
            if (!isShutdown)
                processModuleDefinition(Array.from(arguments));
        }
        catch (exc) {
            log("Error processing module definition", exc);
        }
        return result;
    };
    var set_define = function (value) {
        if (value)
            define.toString = value.toString.bind(value);
        actualDefine = value;
    };
    var get_define = function () {
        if (actualDefine)
            return define;
        else
            return actualDefine;
    };
    Object.defineProperty(context, "define", {
        enumerable: true,
        configurable: false,
        get: get_define,
        set: set_define
    });
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