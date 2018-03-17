const log = _myLog                  // (...args) =>

const waitElement = _waitElement    // async (selector string) => $(selector + ":visible")
const watchElement = (selector, callback) => waitElement(selector).then(async (resp) => {
    await callback(resp)
    await waitTime(500)
    return watchElement(selector, callback)
})
const pressElement = _pressElement  // async (selector string) =>

const waitPressElement = async (selector) => pressElement(await waitElement(selector))
const waitRedirect = _waitRedirect      // async (url) =>
const findElement = async (selector) => new Promise((resolve, reject) => {
    waitElement(selector).then(() => resolve(true))
    waitTime(20).then(() => resolve(false))
})

const waitLoading = _waitLoading    // () => 

const popup = _popup.popup          // (msg, [ms] int) =>

const listenWebSocket = _listenWebsocketMessage // (cb => bool, [once] bool = true) =>
const doClientClick = _doClientClick
const listenAjax = _listenAjaxComplete // (event => bool, [once] bool = true) =>
const clientAjax = _doClientAjax    // async (url, [data]) => resp

const waitSelectSupporter = _selectSupporter // async (filter Array[string]) => 
const waitSelectDeck = _selectDeck      // async (groupID, number) =>
const waitPressSkill = _pressSkill      // async (charID int, number int) =>
const waitPressSummon = _pressSummon    // async (summonID) =>
const waitPressAuto = _waitPressAuto
const waitJoinRaid = _waitJoinRaid
const waitConfirmPendingBattle = _waitConfirmPendingBattle

onPost(evt.ACTION_PRESS, pressElement)
onPost(evt.ACTION_WAIT_ELEMENT, async selector => {await waitElement(selector); return true})
onPost(evt.ACTION_WAIT_LOADING, waitLoading)
onPost(evt.ACTION_WAIT_REDIRECT, waitRedirect)
onPost(evt.ACTION_WAIT_PRESS, waitPressElement)
onPost(evt.ACTION_LOG, log)

onPost(evt.ACTION_WAIT_PRESS_AUTO, waitPressAuto)
onPost(evt.ACTION_WAIT_JOIN_RAID, waitJoinRaid)
onPost(evt.ACTION_WAIT_PRESS_SKILL, ({charID, number}) => waitPressSkill(charID, number))
onPost(evt.ACTION_WAIT_PRESS_SUMMON, waitPressSummon)

onPost(evt.ACTION_WAIT_SELECT_SUPPORTER, waitSelectSupporter)
onPost(evt.ACTION_WAIT_SELECT_DECK, ({groupID, number}) => waitSelectDeck(groupID, number))
onPost(evt.ACTION_WAIT_CONFIRM_PENDING_BATTLE, waitConfirmPendingBattle)

// listenWebSocket((data) => {
//     log("listen websocket message", data)
//     const str = data
//     const hpp = str.indexOf("boss1_hp")
//     const hp = parseInt(str.slice(str.indexOf(":", hpp) + 1, str.indexOf(",", hpp)))
//     log("auto battle hp = ", hp)

//     if (hp === 0) {
//         if (!state.auto_battle()) return
//         log("刷新至结果"); 
//         setTimeout(() => {
//             if (!state.auto_battle()) return
//             window.location.href = "/#result_multi/" + resp.raid_id + "/3"
//             log("战斗结束")
//             waitForElementToExist(".cnt-result", () => {
//                 setTimeout(() => {
//                     canRetry = true
//                 }, 2000)
//             }, true)
//         }, 1000)
//         return true
//     }
// })