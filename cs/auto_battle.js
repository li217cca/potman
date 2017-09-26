
// href /#event/teamraid033/supporter/722131/1
// /quest/check_quest_start/72214/1/722131
// /quest/quest_data/722131/1
// /teamraid033/rest/quest/create_quest

// tryCreateQuest
var canRetry = true
log("auto battle init")
const tryAutoBattle033 = () => {
    if (!state.auto_battle()) return
    log("try auto battle", status.ap, !(status.ap < 30))
    if (status.ap < 30) return
    canRetry = false
    doClientAjax("/quest/check_quest_start/72213/1/722131", undefined, resp => {
        log("check_quest", resp.result)
        if (resp.result === "ok") {
            window.location.href = "/#event/teamraid033/supporter/722131/1"
            
            tryCreateQuest("/teamraid033/rest/quest/create_quest", 722131, ["アナト"])
        } else {
            log("error", resp)
        }
    })
}
setInterval(() => {
    if (canRetry && state.auto_battle()) {
        tryAutoBattle033()
    }
}, 3000)

const tryCreateQuest = (url, quest_id, supporter_filter) => {
    log("try create quest", quest_id, supporter_filter)

    waitForElementToExist("div.prt-supporter-attribute", () => {
        for (let key of supporter_filter) {
            const res = $(".btn-supporter.lis-supporter:contains(" + key + ")")
            if (res.length > 0) {
                const params = res[0].attributes
                log("find supporters " + key, parseInt(params["data-supporter-user-id"].value))
                createMyQuest(url, quest_id, 
                    parseInt(params["data-supporter-user-id"].value), 
                    parseInt(params["data-attribute"].value))
                return
            }
        }
    }, true)
}

// 722131
const createMyQuest = (url, quest_id, supporterUserID, supporterAttribute_id) => {
    const options = {
        special_token: null,
        deck_id: 42,
        quest_id: quest_id,
        quest_type: 1,
        supporter_user_id: supporterUserID,
        duplicate_key: 1,
        supporter_attribute_id: supporterAttribute_id // 4
    }
    log("create quest", options)

    doClientAjax(url, JSON.stringify(options), resp => {
        log("create quest resp=", resp)
        if (resp.result == "ok") {
            window.location.href = "#raid_multi/" + resp.raid_id
            
            autoBattle033()
            
            
            listenWebsocketMessage((data) => {
                if (!state.auto_battle()) return
                log("listen websocket message", data.data)
                const str = data.data
                const hpp = str.indexOf("boss1_hp")
                const hp = parseInt(str.slice(str.indexOf(":", hpp) + 1, str.indexOf(",", hpp)))
                log("auto battle hp = ", hp)

                if (hp === 0) {
                    if (!state.auto_battle()) return
                    log("刷新至结果"); 
                    setTimeout(() => {
                        if (!state.auto_battle()) return
                        window.location.href = "/#result_multi/" + resp.raid_id + "/3"
                        log("战斗结束")
                        waitForElementToExist(".cnt-result", () => {
                            setTimeout(() => {
                                canRetry = true
                            }, 2000)
                        }, true)
                    }, 1000)
                    return true
                }
            }, true)

        } else log("create quest error")
    })
}

var readyToAttack = false
waitForElementToExist(".btn-attack-start.display-on", function () {
    if (!state.auto_battle() || !readyToAttack) return
    log("点击攻击"); 
    readyToAttack = false
    pressBySelector(".btn-attack-start.display-on")
    setTimeout(() => {
        waitForElementToExist(".btn-auto", function () {
            log("点击自动")
            pressBySelector(".btn-auto")
        }, true)
    }, 300)
})

const autoBattle033 = () => {
    log("auto battle 033 start")
    waitForElementToExist(".quick-summon.available", () => {
        waitForElementToExist(".btn-attack-start.display-on", function () {
            log("press quick summon")
            pressBySelector(".quick-summon.available")
            const skills = $(".lis-ability.btn-ability-available.quick-button")
            const debuff = skills.filter((_, dom) => dom.title.includes("ミゼラブルミスト"))
            setTimeout(() => {
                if (debuff.length > 0) {
                    log("press debuff")
                    pressByJquery(debuff)
                }
                setTimeout(() => {
                    readyToAttack = true
                }, 300 + Math.random()*200)
            }, Math.random()*200 + 100)
        }, true)
    }, true)
}