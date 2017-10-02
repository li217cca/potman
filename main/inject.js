const ajaxCompleteListeners = new Set()
function listenAjaxComplete(callback, once) {
    const cb = (data) => {
        if (callback(data) && once) {
            ajaxCompleteListeners.delete(cb)
        }
    }
    ajaxCompleteListeners.add(cb)
}
function onWindowMessage(evt) {
    if (!evt.data.type) return
    if (!state.run()) return
    switch (evt.data.type) {
        case "pmHello":
            sandbox.finishChannelSetup()
            return;
        case "externalLog":
            log(...evt.data.args)
            return;
        case "ajaxBegin":
            // onAjaxBegin(evt.data.url, evt.data.requestData, evt.data.uid);
            return;
        case "ajaxComplete":
            ajaxCompleteListeners.forEach(cb => cb(evt.data))
            return;
        case "stageTick":
            // prevent finished combat state from being set back to unfinished in a raid
            // if (combatState &&
            //     combatState.is_multi &&
            //     combatState.finish &&
            //     !evt.data.state.finish &&
            //     (combatState.raid_id == evt.data.state.raid_id)) {
            //     evt.data.state.finish = true;
            // }
            // combatState = evt.data.state;
            return;
        case "doAjaxResult":
            var token = evt.data.token;
            var callback = ajaxCallbacks[token];
            delete ajaxCallbacks[token];
            callback(evt.data.result, evt.data.error, evt.data.url);
            return;
        case "userIdAndTabId":
            var token = evt.data.token;
            var callback = uidCallbacks[token];
            delete uidCallbacks[token];
            callback(evt.data.uid, evt.data.tabId);
            return;
        case "getSkillState":
            var skillState = getSkillState();
            sendExternalMessage({
                type: "socketResult",
                id: evt.data.id,
                result: skillState
            });
            return;
        case "getExtensionVersion":
            chrome.runtime.sendMessage({ type: "getVersion" }, function (version) {
                sendExternalMessage({
                    type: "socketResult",
                    id: evt.data.id,
                    result: version
                });
            });
            return;
        case "getBookmarks":
            var keys = Object.keys(allBookmarks);
            sendExternalMessage({
                type: "socketResult",
                id: evt.data.id,
                result: keys
            });
            return;
        case "visitBookmark":
            var handler = allBookmarks[evt.data.key];
            sendExternalMessage({
                type: "socketResult",
                id: evt.data.id,
                result: !!handler
            });
            handler();
            return;
        case "tryUseSummon":
            var elements = document.querySelectorAll("div.lis-summon[summon-name=\"" + evt.data.name + "\"]");
            if (!elements || elements.length == 0) {
                sendExternalMessage({
                    type: "socketResult",
                    id: evt.data.id,
                    result: "not found"
                });
                return;
            }
            for (var i = 0, l = elements.length; i < l; i++) {
                var element = elements[i];
                if (element.className.indexOf("btn-summon-available") >= 0) {
                    pendingOneClickSummonId = evt.data.id;
                    var scheduleResult = scheduleOneClickSummon(element, null);
                    if (scheduleResult !== "ok")
                        sendExternalMessage({
                            type: "socketResult",
                            id: evt.data.id,
                            result: scheduleResult
                        });
                    return;
                }
            }
            sendExternalMessage({
                type: "socketResult",
                id: evt.data.id,
                result: "on cooldown"
            });
            return;
        case "connectionStatusChanged":
            isRemoteConnected = evt.data.connected;
            return;
        case "error":
            log(evt.data.stack);
            return;
        case "frameStats":
            updatePerformanceHud(evt.data);
            return;
        case "tryRepeatLastQuest":
            repeatLastQuest(null, function (result, reason) {
                sendExternalMessage({
                    type: "socketResult",
                    id: evt.data.id,
                    result: result ? "ok" : reason
                });
            });
            return;
        case "tryJoinRaid":
            state.prprRun() && tryJoinRaid(evt.data.code);
            return;
        case "webSocketMessageReceived":
            websocketMessageListeners.forEach(cb => cb(evt.data))
            log("web socket message", evt.data)
            return
        default:
            log("Unknown window message " + evt.data.type);
            return;
    }
}

const websocketMessageListeners = new Set()
function listenWebsocketMessage(callback, once) {
    const cb = (data) => {
        log("call listen websocket message cb")
        if (callback(data) && once) {
            websocketMessageListeners.delete(cb)
        }
    }
    websocketMessageListeners.add(cb)
}


var nextAjaxToken = 0
const ajaxCallbacks = {}
function doClientAjax(url, data, callback) {
    if (!state.run())
        return
    
    var token = ++nextAjaxToken;
    ajaxCallbacks[token] = callback;
    // console.log("ajax ", url, window.location.hash);
    sandbox.sendExternalMessage({
        type: "doAjax",
        token: token,
        data: data,
        url: url
    });
}
const validSupporterList = ["カグヤ", "ホワイトラビット"]

const tryJoinRaid = (code) => {
    if (typeof code !== "string" || code.length !==8) return
    log("try join raid", code)

    var payload = {
        special_token: null, 
        battle_key: code
    }
    doClientAjax("/quest/battle_key_check", JSON.stringify(payload), resp => {

        log("try join raid resp = ")
        
        if (typeof (resp) === "string") resp = JSON.parse(resp)

        if (resp.popup && resp.popup.body) {
            doPopup(resp.popup.body)
            return log("popup: " + resp.popup.body)
        }
        if (resp.redirect) {
            if (window.location.href != resp.redirect) {
                window.location.href = resp.redirect
                var wait = true 
                waitForElementToExist("div.prt-supporter-attribute", function () {
                    if (!wait) return
                    wait = false
                    log("wait for supporter to exist", validSupporterList)
                    const supporterMap = {}
                    
                    validSupporterList.forEach(key => {
                        const supporters = $(".prt-supporter-detail:contains(" + key + ")")
                        if (supporters.length > 0) {
                            supporterMap[key] = parseInt(supporters[0].parentElement.parentElement.attributes["data-supporter-user-id"].value)
                        }
                    })
                    log("find supporters", supporterMap)
                    for (let key of validSupporterList) {
                        if (!!supporterMap[key]) {
                            joinRaid(resp.redirect, supporterMap[key])
                            break
                        }
                    }
                }, true)
            }
            return log("to: " + resp.redirect)
        }
        if ((typeof (resp.current_battle_point) === "number") && !resp.battle_point_check) {
            doPopup("Refill required, need " + resp.used_battle_point + "bp")
            log("Refill required, need " + resp.used_battle_point + "bp")
            log("return bp")
            return "bp"
        }
        if (resp.idleTimeout) {
            doPopup("tryJoinRaid idle timeout")
            log("tryJoinRaid idle timeout")
            return 
        }
        doPopup("tryJoinRaid unknown response: " + JSON.stringify(resp))
        log("tryJoinRaid unknown response: " + JSON.stringify(resp))
        return 
    })
}

// {"":null,"raid_id":"3378935189","supporter_user_id":15380563,"user_deck_priority":31,"select_bp":"2","duplicate_key":1,"supporter_attribute_id":0}


let lock = false

let pendingNum = 0
const attack = () => {
    pressBySelector(".btn-attack-start.display-on")
    setTimeout(() => {
        waitForElementToExist(".btn-auto", function () {
            log("点击自动")
            pressBySelector(".btn-auto")
            lock = false
            pendingNum ++
        }, true)
    }, 300)
}
const joinRaid = (url, supporterID) => {
    const raid_id = url.slice(url.indexOf("supporter_raid") + 15, url.indexOf("/", url.indexOf("supporter_raid") + 15))
    const options = {
        special_token: null,
        raid_id: raid_id,
        supporter_user_id: supporterID,
        user_deck_priority: 31,
        select_bp: "3",
        duplicate_key: 1,
        supporter_attribute_id: 0 // normal 0
    }
    log("join raid", options)
    doClientAjax("quest/raid_deck_data_create", JSON.stringify(options), resp => {
        log("join raid resp=", resp)
        if (resp.result) {
            lock = new Date()
            window.location.href = "#raid_multi/" + resp.raid_id
            waitForElementToExist(".btn-attack-start.display-on", () => {
                log("raid click attack once")
                attack()
            }, true)
        } else log("join raid error")
    })
}
let time = 0
const autoConfirm = () => {
    if (!state.auto_confirm_pending() || pendingNum === 0) return
    if (lock !== false && (new Date - lock) < 10000) return
    log("try auto confirm")
    location.href = "/#quest/assist/unclaimed"
    waitForElementToExist(".btn-multi-raid.lis-raid", (targets) => {
        pendingNum = document.querySelectorAll(".btn-multi-raid.lis-raid").length
        setTimeout(() => {
            log("press confirm raid.. time = ", ++time)
            pressBySelector(".btn-multi-raid.lis-raid")
            pendingNum --
        }, 1341)
    }, true)
}
setInterval(autoConfirm, 5000)

listenAjaxComplete(data => {
    if (data.url.indexOf("/user/status") >= 0) {
        if (!!data.responseData) {
            const s = JSON.parse(data.responseData)
            Object.assign(status, s.status)
            log("status ap=", status.ap, "bp=", status.bp)
            conn.postMessage({type: "status", status: status})
        }
    }
})
