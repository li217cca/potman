
// waitForElementToExist(".txt-title:contains(エラー)", function () {
//     log("出现错误！"); state.error = true
// })
// waitForElementToExist(".prt-popup-header:contains(画像認証)", function () {
//     log("出现验证码！"); state.captcha = true
// })


// const _autoCoopRun = async () => {
//     const _thisRun = () => {
//         return state.run && state.coop_run && !state.error && !state.captcha
//     }
//     setInterval(() => {
//         if (_thisRun()) pressElement(".btn-members-refresh: visible")
//     }, 3000)
//     listenSuperPostMessage(msg => {
//         if (msg.type == evt.BATTLE_WIN) {
//             waitRedirect("/#coopraid")
//         }
//     })
// }

// var isAttack = false
// listenAjaxComplete(data => {
//     if (data.url.indexOf("mvp_info") >= 0) {
//         if (!!data.responseData && data.responseData.indexOf("point") > 0) {
//             log("is attack =", true)
//             isAttack = true
//         }
//     }
    
//     if (data.url.indexOf("start.json") >= 0) {
//         if (!!data.responseData) {
//             const state = JSON.parse(data.responseData)
//             log("is attack", state)
//             const hp = parseInt(state.boss.param[0].hp), hpmax = state.boss.param[0].hpmax
//             log("is attack ?", hp, hpmax)
//             isAttack = (hp !== hpmax)
//         }
//     }
// })

// var prepareAttack = null
// listenWebsocketMessage((data) => {
//     if (!state.coop.run()) return
//     log("listen websocket message", data.data)
//     const str = data.data
//     const p1 = str.indexOf("point"), p2 = str.indexOf("point", p1+1), hpp = str.indexOf("boss1_hp")
//     const point1 = parseInt(str.slice(p1 + 8, str.indexOf('"', p1 + 8)))
//     const point2 = parseInt(str.slice(p2 + 8, str.indexOf('"', p2 + 8)))
//     const hp = parseInt(str.slice(str.indexOf(":", hpp) + 1, str.indexOf(",", hpp)))
//     log("battle point", point1, point2, "hp = ", hp)
//     if (point1 > 0 || point2 > 0) {
//         if (prepareAttack) {
//             prepareAttack()
//             prepareAttack = null
//         }
//     }
//     if (point1 > 0 && point2 > 0 && hp === 0) {
//         if (!state.coop.run()) return
//         log("刷新至结果"); 
//         setTimeout(() => {
//             if (!state.coop.run()) return
//             window.location.href = "/#coopraid"
//             // TODO： 检验第二次刷新
//             waitForElementToExist(".prt-result-head", function () {
//                 if (!state.coop.run()) return
//                 log("刷新至共斗");
//                 window.location.href = "/#coopraid"
//             }, true)
//         }, 300)
//     }
// })
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