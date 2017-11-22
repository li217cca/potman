const _coopRun = () => {
    return state.run && state.coop_run && !state.halt
}
log("Auto coop raid init...")
const pressFresh = async () => {
    await waitTime(3000)
    await waitElement(".btn-members-refresh: visible")
    await pressElement(".btn-members-refresh: visible")
    pressFresh()
}

listenSuperPostMessage(msg => {
    if (_coopRun() && msg.type == evt.BATTLE_WIN) {
        log("刷新至共斗")
        waitRedirect("/#coopraid")
    }
})
watchElement(".prt-result-head", async () => {
    if (!_coopRun()) return
    log("刷新至共斗 02")
    await waitTime(500)
    await waitRedirect("/#coopraid")
})

watchElement(".btn-execute-ready.se-ok", async () => {
    if (!_coopRun()) return
    await pressElement(".btn-execute-ready.se-ok")
    log("点击准备")
})
watchElement(".btn-quest-start.multi.se-quest-start.onm-tc-gbf", () => {
    if (!_coopRun()) return
    pressElement(".btn-quest-start.multi.se-quest-start.onm-tc-gbf")
    log("点击start")
})
let _isAttack = false
watchElement(".btn-attack-start.display-on", () => {
    if (!_coopRun()) return
    if (state.coop_script.last && !_isAttack) {
        return
    }
    log("点击攻击")
    _isAttack = false
    pressElement(".btn-attack-start.display-on")
})

listenAjax(data => {
    if (data.url.indexOf("mvp_info") >= 0) {
        if (!!data.responseData && data.responseData.indexOf("point") > 0) {
            log("is attack =", true)
            _isAttack = true
        }
    }
    
    if (data.url.indexOf("start.json") >= 0) {
        if (!!data.responseData) {
            const state = JSON.parse(data.responseData)
            log("is attack", state)
            const hp = parseInt(state.boss.param[0].hp), hpmax = state.boss.param[0].hpmax
            log("is attack ?", hp, hpmax)
            _isAttack = (hp !== hpmax)
        }
    }
})

listenWebSocket((data) => {
    if (!state.coop.run()) return
    log("listen websocket message", data.data)
    const str = data.data
    const p1 = str.indexOf("point"), p2 = str.indexOf("point", p1+1)
    const point1 = parseInt(str.slice(p1 + 8, str.indexOf('"', p1 + 8)))
    const point2 = parseInt(str.slice(p2 + 8, str.indexOf('"', p2 + 8)))
    log("battle point", point1, point2)
    if (point1 > 0 || point2 > 0) {
        _isAttack = true
    }
})
// var waitPress = false
// waitForElementToExist(".btn-attack-start.display-on", function () {
//     if (!state.coop.run()) return
//     waitPress = false
//     const attack = () => {
//         log("点击攻击"); pressBySelector(".btn-attack-start.display-on")
//     }
//     if (state.coop.first()) {
//         setTimeout(attack, 1000)
//     } else if (isAttack) {
//         isAttack = false
//         attack()
//     } else {
//         prepareAttack = attack
//     }
// })
// setInterval(() => {
//     waitPress = false
// }, 5000)
// log("install wait press prepare")
// waitForElementToExist(".btn-execute-ready.se-ok", function () {
//     if (!state.coop.run() || waitPress) return
//     waitPress = true
//     log("点击准备"); pressBySelector(".btn-execute-ready.se-ok")
// })
// waitForElementToExist(".btn-quest-start.multi.se-quest-start.onm-tc-gbf", function () {
//     if (!state.coop.run() || waitPress) return
//     waitPress = true
//     log("点击start"); pressBySelector(".btn-quest-start.multi.se-quest-start.onm-tc-gbf")
// })