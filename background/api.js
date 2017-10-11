
const lock = _lock
const unlock = _unlock

const pressElement = async selector => post(evt.ACTION_PRESS, selector)
const waitLock = _waitLock
const waitBossDie = _waitBossDie
const waitTime = ms => new Promise(resolve => setTimeout(resolve, ms))
const waitElement = async selector => post(evt.ACTION_WAIT_ELEMENT, selector)
const waitLoading = async () => post(evt.ACTION_WAIT_LOADING)
const waitRedirect = async url => post(evt.ACTION_WAIT_REDIRECT, url)
const waitBattleCount = number => waitState(state => state.battle_count === number)()
const waitBattleEnd = () => waitBattleCount(state.battle_count_total)
const waitPressElement = async selector => post(evt.ACTION_WAIT_PRESS, selector)
const waitPressSkill = async (charID, number) => post(evt.ACTION_WAIT_PRESS_SKILL, {charID, number})
const waitPressSummon = async (summonID) => post(evt.ACTION_WAIT_PRESS_SUMMON, summonID)
const waitPressAttack = async () => post(evt.ACTION_WAIT_PRESS, ".btn-attack-start.display-on:visible")
const waitPressAuto = async () => post(evt.ACTION_WAIT_PRESS_AUTO, ".btn-auto:visible")
const waitSwitchChargeOn = async () => {
    await post(evt.ACTION_WAIT_ELEMENT, ".btn-lock:visible")
    post(evt.ACTION_PRESS, ".btn-lock.lock1")
}
const waitSwitchChargeOff = async () => {
    await waitElement(".btn-lock:visible")
    post(evt.ACTION_PRESS, ".btn-lock.lock0")
}

const waitSelectSupporter = async filter => post(evt.ACTION_WAIT_SELECT_SUPPORTER, filter)
const waitSelectDeck = async (groupID, number) => post(evt.ACTION_WAIT_SELECT_DECK, {groupID, number})
const waitJoinRaid = async raid_id => post(evt.ACTION_WAIT_JOIN_RAID, raid_id)

const waitPendingBattle = waitState(state => state.pending_battle > 1)
const waitConfirmPendingBattle = async () => post(evt.ACTION_WAIT_CONFIRM_PENDING_BATTLE)