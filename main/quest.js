
const _redirectTo = async (url) => {
    log("Redirect to", [url])
    await waitModelRun()
    location.href = url
    return waitLoading()
}

const _pressSkill = async (charID, numbers) => {
    // TODO FIXME
    await pressElement(".btn-command-back.display-on")
    charID -= 1
    await waitPressElement(".btn-command-character.lis-character" + charID)
    if (typeof numbers == "number") {
        await waitPressElement(".prt-command-chara.chara" + charID + ":visible .lis-ability:eq(" + (numbers - 1) + ")")
    } else {
        for (let number of numbers) {
            await waitPressElement(".prt-command-chara.chara" + charID + ":visible .lis-ability:eq(" + (number - 1) + ")")
            await waitTime(100)
        }
    }
    await pressElement(".btn-command-back.display-on")
}


const _waitBattleCount = number => _model.makeWait(state => {
    _myLog("_waitBattleCount", state.battle_count)
    return (typeof state.battle_count === "number") && state.battle_count === number
})

const _selectSupporter = async (filter) => {
    await waitModelRun()
    await waitLoading()

    await waitElement(selectors.supporterTitle)
    return new Promise((resolve, reject) => {
        if (filter.every(key => {
            log("try select supporter by", key)
            const target = $(".btn-supporter.lis-supporter:contains(" + key + "):first")
            if (target.length < 1) return true
            if (!target.parent().hasClass("disableView")) {
                resolve(pressElement(target))
                return false
            } else {
                const tmp = target.attr("data-attribute")
                const attr = tmp == "10" ? "0" : tmp
                const func = async () => {
                    await waitModelRun()
                    await waitLoading()
                    await pressElement(".btn-type[data-type=" + attr + "]")

                    return pressElement(target)
                }
                func().then(resolve)
                return false
            }
            return true
        })) {
            _popup.popup("没有合适的召唤: " + filter)
            reject("can't find supporter with" + filter)
        }
    })
}

const _selectDeck = async (groupID, number) => {
    log("try select deck")
    await waitModelRun()
    await waitLoading()

    log("press group id =", groupID)
    const group = await waitElement(".btn-select-group.id-" + groupID)
    await pressElement(group)
    await waitLoading()

    log("press list number =", number)
    const btn = await waitElement(".flex-control-nav.flex-control-paging li:eq(" + (number - 1) + ")")
    await pressElement(btn)

    log("press ok")
    return pressElement(".btn-usual-ok.se-quest-start")
}

const _waitLoading = async () => {
    await waitTime(Math.random()*20 + 10)
    return waitElement("#loading:hidden")
}