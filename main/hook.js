
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

// hook error
waitElement(".div:contains(エラー)").then(() => {
    superPostMessage({type: evt.SET_STATE, state: {
        run: false
    }})
    popup("出现エラー！")
})
waitElement(".div:contains(画像認証)").then(() => {
    superPostMessage({type: evt.SET_STATE, state: {
        run: false
    }})
    popup("出现画像認証！")
})

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
const handleScenario = (scenario) => {
    scenario.forEach(event => {
        if (event.cmd == "die" && event.to == "boss") {
            log("boss die", event.pos)
            superPostMessage({type: evt.BOSS_DIE, pos: event.pos})
        }
        if (event.cmd == "win") {
            log("win", event)
            superPostMessage({type: evt.BATTLE_WIN, last: event.is_last_raid})
        }
    })
}

listenAjax(data => {
    if (data.url.indexOf("normal_attack_result.json") >= 0) {
        log("try boss die", event)
        if (!!data.responseData) {
            const tmp = JSON.parse(data.responseData)
            handleScenario(tmp.scenario)
        }
    }
})

listenWebSocket(tmp => {
    // TODO: 重写
    // ```
    // 42["raid",{"bossUpdate":{"timestamp":"1508690379.86492200","param":{"boss1_hp":0,"boss1_mode":1,"boss1_mode_gauge":0,"boss1_condition":{"buff":null,"debuff":[{"status":"1103","is_unusable_harb":false,"personal_debuff_user_id":false,"personal_status":"1103","personal_debuff_end_turn":false}],"num":1}}},"mvpUpdate":{"timestamp":"1508690379.86497100","mvpList":[{"viewer_id":"137461580","user_id":"13232517","point":"10010","rank":1}]},"logAdd":{"timestamp":"1508690379.86511800","log":[{"viewer_id":"137461580","user_id":"13232517","comment":{"ja":"[01:39] Liccaのパーティが攻撃<br><span class=\"red\">→151ダメージを与えた！</span>","en":"[01:39] Licca's party attacked!<br><span class=\"red\">151 damage!</span>"},"type":1}]}}]
    // 42["raid",{"bossUpdate":{"timestamp":"1508690168.73298900","param":{"boss1_hp":206479,"boss1_mode":1,"boss1_mode_gauge":0,"boss1_condition":{"buff":null,"debuff":[{"status":"1103","is_unusable_harb":false,"personal_debuff_user_id":false,"personal_status":"1103","personal_debuff_end_turn":false}],"num":1}}},"scenarioPlay":{"timestamp":"1508690168.73303700","user_id":"13232517","scenario":[{"cmd":"effect","to":"boss","kind":"ab_powerup","mode":"serial","name":"","list":"0"},{"cmd":"battlelog","value":"value","title":{"ja":"バトルログ","en":"Battle Log"},"body":{"ja":"Lv65 儚きクリストフが真の力を解放した！","en":"Lvl 65 Christoph Matchstick has unleashed its true power!"}},{"cmd":"boss_gauge","pos":0,"name":{"ja":"Lv65 儚きクリストフ","en":"Lvl 65 Christoph Matchstick"},"attr":1,"hp":236479,"hpmax":1000000,"no_attribute_flag":""},{"cmd":"formchange","form":1,"param":{"attr":1,"name":{"ja":"Lv65 儚きクリストフ","en":"Lvl 65 Christoph Matchstick"},"effect":"ehit_me_0001","cjs":"enemy_2100103","extra_attr":0},"pos":0,"to":"boss","type":null,"no_motion":null,"no_change_motion":null,"bg_image":"/sp/raid/bg/03rc_3.jpg","fullscreen":""}]},"mvpUpdate":{"timestamp":"1508690168.73304600","mvpList":[{"viewer_id":"137461580","user_id":"13232517","point":"7936","rank":1}]},"logAdd":{"timestamp":"1508690168.73359100","log":[{"viewer_id":"137461580","user_id":"13232517","comment":{"ja":"[01:36] チェインバースト！ブルーデトネーションが発動！<br><span class=\"orange\">→1745ダメージを与えた！</span>","en":"[01:36] Chain attack Blue Detonation released!<br><span class=\"orange\">1745 damage!</span>"},"type":3},{"viewer_id":"137461580","user_id":"13232517","comment":{"ja":"[01:36] Liccaのパーティが奥義追加効果を発動！<br><span class=\"yellow\">→666666ダメージを与えた！</span>","en":"[01:36] Licca's party used C.A. Bonus Effect!<br><span class=\"yellow\">666666 damage!</span>"},"type":4},{"viewer_id":"137461580","user_id":"13232517","comment":{"ja":"[01:36] Liccaのパーティが攻撃<br><span class=\"red\">→4693ダメージを与えた！</span>","en":"[01:36] Licca's party attacked!<br><span class=\"red\">4693 damage!</span>"},"type":1}]},"bgmPlay":{"timestamp":"1508690168.73382500","user_id":"13232517","bgm":"bgm/09_battle_quest_03.mp3"}}]
    // ```
    log("listenWebSocket", tmp)
    let data = {}
    try {
        data = JSON.parse(tmp.data.slice(2))
        const tmp = JSON.parse(data)
        handleScenario(tmp["1"].scenarioPlay.scenario)
        // TODO: 完成hook
    } catch(e) {
        console.error("handle ws data", err)
        // log(e)
    }
    // const str = data.data
    // const p1 = str.indexOf("point"), p2 = str.indexOf("point", p1+1), hpp = str.indexOf("boss1_hp")
    // const point1 = parseInt(str.slice(p1 + 8, str.indexOf('"', p1 + 8)))
    // const point2 = parseInt(str.slice(p2 + 8, str.indexOf('"', p2 + 8)))
    // const hp = parseInt(str.slice(str.indexOf(":", hpp) + 1, str.indexOf(",", hpp)))
    // log("battle point", point1, point2, "hp = ", hp)
    // if (point1 > 0 || point2 > 0) {
    //     if (prepareAttack) {
    //         prepareAttack()
    //         prepareAttack = null
    //     }
    // }
    // if (point1 > 0 && point2 > 0 && hp === 0) {
    //     if (!state.coop.run()) return
    //     log("刷新至结果"); 
    //     setTimeout(() => {
    //         if (!state.coop.run()) return
    //         window.location.href = "/#coopraid"
    //         // TODO： 检验第二次刷新
    //         waitForElementToExist(".prt-result-head", function () {
    //             if (!state.coop.run()) return
    //             log("刷新至共斗");
    //             window.location.href = "/#coopraid"
    //         }, true)
    //     }, 300)
    // }
})