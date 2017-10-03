
const modelUpdate = _model.update   // (state) => 
const modelMakeWait = _model.makeWait    // async (state => bool) => 

const waitModelRun = _waitModelRun  // async () =>
const waitModelBP3 = _waitModelBP3  // async () =>
const waitBattleCount = _waitBattleCount // async (number) =>

const lockLock = _lock.lock         // (ms int) =>
const lockUnlock = _lock.unlock     // () =>
const waitLock = _lock.wait         // async () => 

const log = _myLog                  // (...args) =>
const waitElement = _waitElement    // async (selector string) => $(selector + ":visible")
const pressElement = _pressElement  // async (selector string) =>
const waitPressElement = async (selector) => pressElement(await waitElement(selector))

const waitTime = _waitTime
const waitLoading = _waitLoading    // () => 

const superPostMessage = _superPostMessage   // (msg) =>
const superOnMessage = _superOnMessage   // (type, callback) =>

const popup = _popup.popup          // (msg, [ms] int) =>

const listenWebSocket = _listenWebsocketMessage // (cb => bool, [once] bool = true) =>
const listenAjax = _listenAjaxComplete // (event => bool, [once] bool = true) =>
const clientAjax = _doClientAjax    // async (url, [data]) => resp

const waitSelectSupporter = _selectSupporter // async (filter Array[string]) => 
const waitSelectDeck = _selectDeck      // async (groupID, number) =>
const waitRedirect = _redirectTo      // async (url) =>
const waitPressSkill = _pressSkill      // async (charID int, array[number int]) =>


const updateState = (state) => {superPostMessage({type: evt.SET_STATE, state: state})}


listenAjax(data => {
    if (data.url.indexOf("/rest/raid/start.json") > 0) {
        log("listen ajax /rest/raid/start.json", data)
        if (!!data.responseData) {
            const tmp = JSON.parse(data.responseData)
            log("battle count", tmp.battle.count)
            updateState({battle_count: parseInt(tmp.battle.count)})
        }
    }
})

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