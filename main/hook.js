
const validSupporterList = ["カグヤ", "ホワイトラビット"]

const tryJoinRaid = (code) => {
    if (typeof code !== "string" || code.length !==8) return
    log("try join raid", code)

    lock = new Date()
    var payload = {
        special_token: null, 
        battle_key: code
    }
    doClientAjax("/quest/battle_key_check", JSON.stringify(payload), resp => {

        log("try join raid resp = ")
        
        if (typeof (resp) === "string") resp = JSON.parse(resp)

        if (resp.popup && resp.popup.body) {
            doPopup(resp.popup.body)
            lock = false
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

            log("unlisten because bp")
            unlisten = true
            setTimeout(() => {
                log("re listen ...")
                unlisten = false
            }, 1000 * (1200 + Math.random() * 2000))
            lock = false
            return
        }
        if (resp.idleTimeout) {
            doPopup("tryJoinRaid idle timeout")
            log("tryJoinRaid idle timeout")
            lock = false
            return 
        }
        doPopup("tryJoinRaid unknown response: " + JSON.stringify(resp))
        log("tryJoinRaid unknown response: " + JSON.stringify(resp))
        lock = false
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
            window.location.href = "#raid_multi/" + resp.raid_id
            waitForElementToExist(".btn-attack-start.display-on", () => {
                log("raid click attack once")
                attack()
            }, true)
        } else log("join raid error")
    })
}

listenAjax(data => {
    if (data.url.indexOf("/rest/raid/start.json") > 0) {

        if (!!data.responseData) {
            const tmp = JSON.parse(data.responseData)
            const count = parseInt(tmp.battle.count)
            log("battle count", count)
            superPostMessage({type: evt.SET_STATE, state: {
                battle_count: count,
                battle_count_total: tmp.battle.total
            }})
        }
    }
})

listenAjax(data => {
    if (data.url.indexOf("/user/status") >= 0) {
        if (!!data.responseData) {
            const {status} = JSON.parse(data.responseData)
            superPostMessage({type: evt.SET_STATE, state: {
                ap: status.ap,
                bp: status.bp
            }})
        }
    }
})

listenAjax(data => {
    if (data.url.indexOf("normal_attack_result.json") >= 0) {
        log("try boss die", event)
        if (!!data.responseData) {
            const tmp = JSON.parse(data.responseData)
            tmp.scenario.forEach(event => {
                if (event.cmd == "die" && event.to == "boss") {
                    log("boss die", event.pos)
                    superPostMessage({type: evt.BOSS_DIE, pos: event.pos})
                }
            })
        }
    }
})