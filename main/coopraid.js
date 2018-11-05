const _coopRun = () => {
    return state.run && state.coop_run && !state.halt
}
let _doneMethod = false
const setAutorun = async (fn) => {
    while (1) {
        const isLoading = await findElement(".loading:visible") || await findElement(".ready:visible")
        if (isLoading) {
            log("Loading 中")
            await waitTime(500)
            continue
        }
        if (_coopRun()) {
            _doneMethod = await fn()
        }
        
        await waitTime(100)
    }
}

setInterval(async () => {
    if (!_coopRun() || _doneMethod) return
    log("刷新页面")
    location.reload()
}, 10000)
// log("Auto coop raid init...")

listenSuperPostMessage(async msg => {
    if (_coopRun() && msg.type == evt.BATTLE_WIN) {
        await waitTime(500)
        log("刷新至共斗")
        waitRedirect("/#coopraid")
    }
})

setAutorun(async () => {
    await waitTime(3000)
    await waitElement(".btn-members-refresh")
    log("刷新共斗成员")
    await waitPressElement(".btn-members-refresh")
    return true
})

setAutorun(async () => {
    await waitTime(200)
    await waitElement(".prt-result-head")
    await waitTime(50)
    log("刷新至共斗 02")
    await waitRedirect("/#coopraid")
    return true
})

setAutorun(async () => {
    await waitTime(200)
    await waitPressElement(".btn-execute-ready.se-ok")
    log("点击准备")
    await waitTime(1000)
    return true
})

setAutorun(async () => {
    await waitTime(200)
    const noAp = await findElement(".btn-use-full.index-1")
    if (noAp) {
        // await waitTime(200)
        // $(".use-item-num:last option:contains(" + parseInt(10 + (Math.random()-0.5)*6) + ")")[0].selected = true
        await waitPressElement(".btn-use-full.index-1")
        log("使用小红")
        await waitTime(300)
        await waitPressElement(".btn-usual-ok")
        await waitTime(100)
    }
    await waitPressElement(".btn-quest-start")
    log("点击START")
    await waitTime(1000)
    return true
})

let _isAttack = false
setAutorun(async () => {
    await waitTime(200)
    await waitElement(".btn-attack-start.display-on:visible")
    if (state.coop_script.last && !_isAttack) {
        log("_isAttack =", _isAttack)
        if (!Array.prototype.slice.call($(".txt-point")).find(item => false && item.innerText != '0pt')) return false
    }
    _isAttack = false
    await waitTime(100)
    await waitPressSkill(1, 1)
    log("点击技能")
    await waitTime(1000)
    return true
})

listenAjax(data => {
    if (data.url.indexOf("mvp_info") >= 0) {
        if (!!data.responseData && data.responseData.indexOf("point") > 0) {
            _isAttack = true
            log("_isAttack =", _isAttack)
        }
    }
    
    if (data.url.indexOf("start.json") >= 0) {
        if (!!data.responseData) {
            const state = JSON.parse(data.responseData)
            log("is attack", state)
            const hp = parseInt(state.boss.param[0].hp), hpmax = state.boss.param[0].hpmax
            log("is attack ?", hp, hpmax)
            _isAttack = (hp !== hpmax)
            log("_isAttack =", _isAttack)
        }
    }
})

listenWebSocket((data) => {
    if (!_coopRun()) return
    log("listen websocket message", data.data)
    const str = data.data
    const p1 = str.indexOf("point"), p2 = str.indexOf("point", p1+1)
    const point1 = parseInt(str.slice(p1 + 8, str.indexOf('"', p1 + 8)))
    const point2 = parseInt(str.slice(p2 + 8, str.indexOf('"', p2 + 8)))
    log("battle point", point1, point2)
    if (point1 > 0 || point2 > 0) {
        _isAttack = true
        log("point > 0, is_attack =", _isAttack)
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