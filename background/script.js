



// let time = 0
// const autoConfirm = () => {
//     if (!state.auto_confirm_pending() || pendingNum === 0) return
//     if (lock !== false && (new Date - lock) < 10000) return
//     log("try auto confirm")
//     location.href = "/#quest/assist/unclaimed"
//     waitForElementToExist(".btn-multi-raid.lis-raid", (targets) => {
//         pendingNum = document.querySelectorAll(".btn-multi-raid.lis-raid").length
//         setTimeout(() => {
//             log("press confirm raid.. time = ", ++time)
//             pressBySelector(".btn-multi-raid.lis-raid")
//             pendingNum --
//         }, 1341)
//     }, true)
// }
// setInterval(autoConfirm, 5000)
const autoConfirmPending = async () => {
    await waitState(state => state.auto_confirm_pending)()
    await waitPendingBattle()
    await waitLock()
    const token = lock(1000000)
    
    log("try confirm pending battle")
    const resp = await waitConfirmPendingBattle()
    log("confirm resp = ", resp)
    updateState({pending_battle: 0})

    unlock(token)
    autoConfirmPending()
}
autoConfirmPending()
let _preAutoPrpr = null
const autoBattleAutoPrpr = async (raid_id) => {
    if (_preAutoPrpr !== null && new Date() < _preAutoPrpr) {
        return 
    }
    const resp = await autoBattlePrpr(raid_id)
    log("AUTO PRPR RESP", resp)
    if (!resp) {
        _preAutoPrpr = new Date(new Date() - 0 + Math.random() * 2000 * 1000 + 1000000)
        return false
    }
    return true
}
const autoBattlePrpr = async (raid_id) => {
    await waitLock()
    const token = lock(18000)
    const time = new Date()
    
    log("prpr try join raid", raid_id)
    if (!await waitJoinRaid(raid_id)) {
        log("join raid faild")
        unlock(token)
        return false
    }
    await waitSelectSupporter(state.prpr_supporter)
    await waitSelectDeck(...state.prpr_deck)

    updateState({pending_battle: state.pending_battle + 1})

    if (state.prpr_attack) {
        log("prpr attack!!")
        await waitPressAttack()
        await waitPressAuto()
        await waitTime(3000)
    }

    unlock(token)
    return true
}

const autoBattle = async () => {
    await waitState(state => state.auto_battle)()
    await waitLock()
    const battle_script = state.battle_scripts[state.auto_battle_script_id]
    await waitState(state => state.ap >= battle_script.ap)()
    const token = lock(600000)


    log("start auto battle", battle_script.name)
    doPopup("开始运行 " + battle_script.name + " 脚本")
    log("redirect", battle_script.url)
    await waitRedirect(battle_script.url)
    log("select", battle_script.deck.supporter, battle_script.deck.groupID, battle_script.deck.number)
    await waitSelectSupporter(battle_script.deck.supporter)
    await waitSelectDeck(battle_script.deck.groupID, battle_script.deck.number)

    const stage = battle_script.battle.stage


    for (let count in stage) {
        if (stage[count].length > 0) {
            if (parseInt(count + 1) > state.battle_count_total) break
            log("wait battle count", parseInt(count) + 1)
            await waitBattleCount(parseInt(count) + 1)
        }
        for (let method of stage[count]) {
            const args = method.split(" ").filter(k => k.length > 0)
            log("method", args)
            switch (args[0]) {
                case "ATTACK":
                    await waitPressAttack()
                    break
                case "CHARGE_ON":
                    await waitSwitchChargeOn()
                    break
                case "CHARGE_OFF":
                    await waitSwitchChargeOff()
                    break
                case "AUTO":
                    await waitPressAuto()
                    break
                case "SKILL":
                    await waitPressSkill(parseInt(args[1]), parseInt(args[2]))
                    break
                case "SUMMON":
                    await waitPressSummon(parseInt(args[1]))
                    break
            }
        }
    }

    log("wait boss die")
    await waitBattleEnd()
    await waitBossDie()
    log("redirect..")
    await waitRedirect("/#quest")

    await waitTime(5000)
    unlock(token)
    autoBattle()
}
autoBattle()

const autoBattlePolarLight = async () => {
    await waitState(state => state.auto_battle)()
    await waitLock()
    const token = lock(600000)

    await waitRedirect("/#quest/supporter/599851/5")
    await waitSelectSupporter(["シヴァ", "アテナ"])
    await waitSelectDeck(2, 1)
    
    await auto_battle_polar_light_battle_script()

    log("wait redirect", "/#quest")
    await waitRedirect("/#quest")

    await waitTime(3000)
    unlock(token)
    return autoBattlePolarLight()
}

const auto_battle_polar_light_battle_script = async () => {
    log("wait switch charge off")
    await waitSwitchChargeOff()
    log("wait press attack")
    await waitPressAttack()
    log("wait press auto")
    await waitPressAuto()

    log("wait time", 1000, "ms")
    await waitTime(1000)
    
    log("wait battle count = 3")
    await waitBattleCount(3)
    log("wait press auto")
    await waitPressAuto()

    log("wait press skill")
    await waitPressSkill(1, 2)
    await waitPressSkill(1, 3)
    await waitPressSkill(1, 4)
    await waitPressSkill(1, 1)
    await waitPressSkill(2, 4)
    await waitPressSkill(2, 2)
    await waitPressSkill(3, 1)
    await waitPressSkill(4, 3)
    await waitPressSkill(4, 1)

    log("wait press attack")
    await waitPressAttack()
    log("wait press auto")
    await waitPressAuto()

    log("press charge")
    await waitSwitchChargeOn()

    log("wait boss die")
    await waitBossDie()
}