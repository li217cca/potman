
const _waitConfirmPendingBattle = async () => {
    log("try confirm pending battle")
    await _waitRedirect("/#quest/assist/unclaimed")
    await waitElement(".prt-raid-list:visible div")
    if (!await pressElement(".btn-multi-raid.lis-raid:visible:first")) {
        log("only one battle last")
        return true
    }
    await waitElement(".prt-result-head:visible")
    return _waitConfirmPendingBattle()
}

const _waitRedirect = async (url) => {
    log("redirect", url)
    location.href = url
    return await waitLoading()
}

const _waitBlack = async () => {
    await waitElement(".btn-attack-start.display-on:visible")
    return true
}
const _waitPressAuto = async () => {
    return await waitPressElement(".btn-auto:visible")
}

const _pressSkill = async (charID, number) => {
    // TODO FIXME
    await _waitBlack()
    log("press skill", charID, number)
    if (await pressElement(".prt-command-chara.chara" + charID + ":visible .lis-ability:eq(" + (number - 1) + ")")) {
        log("in it success!")
        await waitTime(Math.random()*50 + 100)
        return true
    }
    if ($(".btn-command-back.display-on:visible").length > 0) {
        log("press back")
        await waitPressElement(".btn-command-back.display-on:visible")
        await waitTime(100)
    }
    log('wait press character')
    while (!($(".prt-command-chara.chara" + charID + ":visible .lis-ability:eq(" + (number - 1) + ")").length > 0)) {
        await waitPressElement(".btn-command-character.lis-character" + (charID - 1) + ":visible")
        await waitTime(200)
        log("try again")
    }
    log('wait press skill')
    await waitPressElement(".prt-command-chara.chara" + charID + ":visible .lis-ability:eq(" + (number - 1) + ")")
    log("wait time..")
    await waitTime(Math.random()*50 + 100)
    return true
}


const _selectSupporter = async (filter) => {
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
const waitTime = async ms => {
    return new Promise(resolve => {
        setTimeout(resolve, ms)
    })
}

const _waitLoading = async () => {
    await waitTime(Math.random()*20 + 10)
    await waitElement("#loading:hidden")
    return true
}