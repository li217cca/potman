/**
 * Created by cifer on 2017/9/18.
 */
"use strict";
var abilityHotkeys = ["Q", "W", "E", "R", "T", "Y"];
var altAbilityHotkeys = [null, null, "A", "S"];
var focusedCharacterIndex = null;
var rawServerSkillState;
var serverSkillState;
// { charIndex[1-4]: { ... }
var latestSkillState = {};
function isSkipActive() {
    if (!skipButton)
        skipButton = document.querySelector("div.prt-ability-skip");
    // WTF?
    if (!skipButton)
        return;
    // HACK: The state of this button is backwards for some reason
    var isSkipActive = skipButton.getAttribute("active") === "0";
    return isSkipActive;
}
;
function onNormalAttackBegin() {
    // console.log("Turn begun on server");
    activatingSkillId = null;
    normalAttacking = true;
    partyStateIsDirty = true;
    // combatState.isAttacking doesn't get set back to 0 if auto is on, so use this to force an update
    if (combatState && combatState.auto_attack) {
        updatePanels = true;
    }
    if (combatState &&
        (combatState.skillQueue.length === 2) &&
        (combatState.skillQueue[1] === "NormalAttack" || combatState.skillQueue[1] === "Summon")) {
        updatePanels = true;
    }
    if (pollingInterval) {
        window.clearInterval(pollingInterval);
        pollingInterval = null;
    }
}
;
function onNormalAttackEnd() {
    // console.log("Turn ended on server");
}
;
function onNormalAttackFail() {
    // console.log("Attack failed");
    normalAttacking = false;
}
;
function onSummonBegin() {
    activatingSkillId = null;
    usingSummon = true;
    partyStateIsDirty = true;
}
;
function findSkillButtons(id) {
    return document.querySelectorAll('div.lis-ability > div[ability-id="' + id + '"]');
}
;
function onAbilityCastStart(id) {
    activatingSkillId = null;
    currentSkillRequestId = parseInt(id);
    normalAttacking = false;
    usingSummon = false;
    partyStateIsDirty = true;
    if (combatState && combatState.usingAbility) {
        updatePanels = true;
    }
    if (pollingInterval) {
        window.clearInterval(pollingInterval);
        pollingInterval = null;
    }
    if (currentSettings.showSkillActivationIndicator)
        window.requestAnimationFrame(function () {
            var elts = findSkillButtons(id);
            for (var i = 0, l = elts.length; i < l; i++) {
                var elt = elts[i];
                var pe = (elt.parentElement);
                pe.classList.add("activating");
            }
        });
    // console.log("Skill cast started", id);
}
;
function onAbilityCastEnd(id) {
    // console.log("Skill cast ended on server", id);
    currentSkillRequestId = null;
    partyStateIsDirty = true;
    successfulAbilityCasts.push(parseInt(id));
    if (currentSettings.showSkillActivationIndicator)
        window.requestAnimationFrame(function () {
            var elts = findSkillButtons(id);
            for (var i = 0, l = elts.length; i < l; i++) {
                var elt = elts[i];
                var pe = (elt.parentElement);
                pe.classList.remove("activating");
            }
        });
}
;
function onAbilityCastFail(id, reason) {
    // console.log("Skill cast failed", id, reason);
    currentSkillRequestId = null;
    partyStateIsDirty = true;
    if (currentSettings.showSkillActivationIndicator)
        window.requestAnimationFrame(function () {
            var elts = findSkillButtons(id);
            for (var i = 0, l = elts.length; i < l; i++) {
                var elt = elts[i];
                var pe = (elt.parentElement);
                pe.classList.remove("activating");
            }
        });
}
;
function parseSkillInner(characterNumber, hasClass, getIconAttribute) {
    var id = parseInt(getIconAttribute("ability-id"));
    var name = getIconAttribute("ability-name");
    if (!name)
        return null;
    var recast = parseInt(getIconAttribute("ability-recast"));
    var cooldown = parseInt(getIconAttribute("recaset-default"));
    var description = getIconAttribute("text-data");
    var isPick = Number(getIconAttribute("ability-pick")) > 0;
    if (Number.isNaN(recast) || Number.isNaN(cooldown))
        throw new Error("wtf");
    // FIXME
    return {
        characterNumber: characterNumber,
        id: Number(id),
        index: -1,
        name: name,
        description: description.replace(/<br>/g, "\n").replace(/<.*?>/g, ""),
        recast: recast,
        cooldown: cooldown,
        isPick: isPick
    };
}
;
function parseSkill(button, icon) {
    var characterNumberRe = /ability-character-num-([0-9])-/;
    var m = characterNumberRe.exec(icon.className);
    if (!m)
        return null;
    var characterNumber = parseInt(m[1]);
    var characterState = combatState.party[characterNumber - 1];
    var result = parseSkillInner(characterNumber, function hc(className) {
        // TODO: classList?
        return button.className.indexOf(className) >= 0;
    }, function gia(attributeName) {
        return icon.getAttribute(attributeName);
    });
    if (result) {
        result.characterNumber = characterNumber;
        result.button = button;
        result.icon = icon;
        var iconImg = icon.querySelector("img");
        if (iconImg)
            result.iconUrl = iconImg.src;
    }
    return result;
}
;
function onQuickSkillClick(evt) {
    // TODO: Use evt.isTrusted here to detect synthesized clicks?
    // ignore clicks on the quick skill buttons when a popup is open
    if (isAnyPopupOpen()) {
        if (evt.stopImmediatePropagation)
            evt.stopImmediatePropagation();
        return false;
    }
    // start of the new stuff for the ingame skill queue
    if (!isSkillAvailable(this)) {
        if (evt.stopImmediatePropagation)
            evt.stopImmediatePropagation();
        return false;
    }
    if (combatState.skillQueue.includes("NormalAttack")) {
        if (evt.stopImmediatePropagation)
            evt.stopImmediatePropagation();
        return false;
    }
    // When the player clicks a quick skill we need to make sure that the
    //  regular skill button becomes disabled as a result
    if (!skillMap)
        return;
    var pe = evt.target.parentElement;
    var buttons = skillMap.get(this.id);
    if (this.cooldown > 0)
        window.setTimeout(function () {
            for (var i = 0; i < buttons.length; i++) {
                if (buttons[i] === pe) {
                    continue;
                }
                // having the class name there prevents it from queueing
                buttons[i].querySelector("div[class^='shine']").style.display = "block";
            }
        }, 10);
}
;
function onRailAbilityClick(evt) {
    var index = parseInt(evt.target.getAttribute("index"));
    if ((index === 0) ||
        (index > combatState.skillQueue.length) ||
        (combatState.skillQueue[index] === "NormalAttack") ||
        (combatState.skillQueue[index] === "Summon")) {
        return;
    }
    var icon = document.querySelector(combatState.skillQueue[index]);
    if (!icon)
        return;
    var button = icon.parentNode;
    // ???
    if (!skillMap)
        return;
    var buttons = skillMap.get(parseInt(icon.getAttribute("ability-id")));
    for (var i = 0; i < buttons.length; i++) {
        // remove the tmp-mask class from the buttons
        buttons[i].className = buttons[i].className.split(" ").filter(function (e) {
            return (e !== "tmp-mask");
        }).join(" ");
        buttons[i].querySelector("div[class^='shine']").style.display = "none";
    }
}
function scheduleOneClickSummon(summonElement, evt) {
    var container = document.querySelector("div.prt-list-top.btn-command-summon");
    if (!container)
        return "summon buttons not found";
    var isAvailable = (summonElement.className.indexOf("summon-unavailable") < 0);
    if (!isAvailable)
        return "summon unavailable";
    if (!combatState)
        return "not in combat";
    if (combatState.attacking && !combatState.usingAbility)
        return "attacking";
    /*
     generateClick(container);
     generateClick(summonElement);
     */
    sendExternalMessage({
        type: "trySelectSummon",
        pos: summonElement.getAttribute("pos")
    });
    if (!currentSettings.oneClickQuickSummons)
        return "quick summons disabled";
    var expectedSkillName = summonElement.getAttribute("summon-skill-name");
    if (!expectedSkillName) {
        return "summon has no skill name";
    }
    console.log("Scheduling one-click summon activation");
    pendingOneClickSummon = expectedSkillName;
    return "ok";
}
;
function tryPerformOneClickSummon(expectedSkillName) {
    if (!expectedSkillName)
        return false;
    var button = findVisibleElementWithSelector("div.btn-usual-ok.btn-summon-use");
    if (!button)
        return false;
    if (!canUseAbility() && !combatState.usingAbility)
        return false;
    var pendingId = pendingOneClickSummonId;
    pendingOneClickSummon = null;
    pendingOneClickSummonId = null;
    var actualSkillName = button.getAttribute("summon-skill-name");
    if (actualSkillName !== expectedSkillName) {
        console.log("Expected summon skill '" + expectedSkillName +
            "' but found '" + actualSkillName +
            "' instead, canceling one-click activation");
        if (pendingId)
            sendExternalMessage({ type: "socketResult", id: pendingId, result: "internal error" });
        return true;
    }
    else {
        console.log("Performing one-click summon activation '" + actualSkillName + "'");
    }
    pulseElement(button);
    sendExternalMessage({ type: "tryClickSummonUseButton" });
    if (pendingId)
        sendExternalMessage({ type: "socketResult", id: pendingId, result: "ok" });
    return true;
}
;
function getTargets() {
    var targets = Array.from(document.querySelectorAll("a.btn-targeting"));
    return targets.filter(isVisibleElement);
}
;
function getCurrentTarget() {
    var targets = getTargets();
    for (var i = 0; i < targets.length; i++) {
        var target = targets[i];
        if (!isVisibleElement(target))
            continue;
        if (target.className.indexOf("lock-on") >= 0)
            return { index: i, target: parseInt(target.getAttribute("target")) };
    }
    return null;
}
;
function tryCycleTarget(delta) {
    
}
;
function processSkillHotkey(evt) {

}
;
function getSelectedCharacterNumber() {
    
}
;
function tryEmptySkillQueue() {
    
}
;
function tryToggleChargeAttack() { // toread
    // HACK
    var toggleButton = document.querySelector("div.btn-lock");
    if (toggleButton) {
        pulseElement(toggleButton);
        generateClick(toggleButton);
        return true;
    }
    return false;
}
function tryOpenHealPanel() {
    
}
function isMaskVisible() {
    var mask = findVisibleElementWithSelector("div.mask") ||
        findVisibleElementWithSelector("div.opaque-mask");
    return !!mask;
}
;
function tryAttack() {
    // HACK: We always want to return true so that spacebar presses are consumed in combat.
    var failResult = true;
    if (normalAttacking)
        return failResult;
    // HACK: If some sort of modal is open, don't perform an attack
    if (isMaskVisible())
        return failResult;
    // HACK
    var resultButton = document.querySelector("div.btn-result");
    if (resultButton && combatState && combatState.finish) {
        pulseElement(resultButton);
        generateClick(resultButton, false);
        generateClick(resultButton, true);
        return true;
    }
    // hit the confirm button if ninja mark/anki popup is open
    if (isNinjaMarkPopupOpen() || isAnkiPopupOpen()) {
        var confirmButton = findActiveUsualTextButton();
        pulseElement(confirmButton);
        generateClick(confirmButton);
        return true;
    }
    return failResult;
}
;
function tryPressBackButton(doPulse) {
    var backButton = document.querySelector("div.btn-command-back.display-on");
    if (backButton) {
        if (doPulse)
            pulseElement(backButton);
        generateClick(backButton);
        return true;
    }
}
;
function tryCycleCharacter(keyText) {
    // If the character panel isn't already open, clicking the arrows misbehaves
    var isCharPanelOpen = document.querySelector("div.prt-slide-icon.show-icon");
    if (!isCharPanelOpen)
        return;
    var button;
    if (keyText === "ARROWLEFT")
        button = document.querySelector("div.ico-pre");
    else
        button = document.querySelector("div.ico-next");
    if (!button)
        return false;
    pulseElement(button);
    generateClick(button);
    return true;
}
;
function tryUseItemByNumber(number) {
    var itemContainer = findVisibleElementWithSelector("div.prt-select-item");
    if (!itemContainer)
        return false;
    var items = itemContainer.querySelectorAll("div.lis-item");
    var item = items[(number - 1)];
    if (!item)
        return true;
    pulseElement(item);
    generateClick(item);
    return true;
}
;
function trySelectCharacterByNumber(number) {
    var waitingForCharacterSelection = !!findVisibleElementWithSelector("div.txt-select-chara");
    if (
        // HACK: If the 'tap a member to heal' text is visible, we actually want to pick characters
    //  with the number keys, so skip this
    !waitingForCharacterSelection &&
    // HACK: Some sort of modal is open, so let's try the possibilities...
    isMaskVisible()) {
        return tryUseItemByNumber(number) ||
            true;
    }
    if (number === 5) {
        var button = document.querySelector("div.btn-command-summon");
        if (button) {
            tryPressBackButton(false);
            pulseElement(button);
            generateClick(button);
            return true;
        }
    }
    var isAnyCommandPanelOpen = Array.from(document.querySelectorAll("div.prt-command-chara:not(.quick-panels)"))
            .some(function (e) { return e.style.display === "block"; }) ||
        (document.querySelector("div.prt-command-summon").className.indexOf("summon-show") >= 0);
    if (currentSettings.showQuickPanels &&
        currentSettings.focusQuickPanels &&
        !isAnyCommandPanelOpen) {
    }
    else {
        var characterPortrait = document.querySelector('div.btn-command-character[pos="' + (number - 1) + '"]');
        if (!characterPortrait)
            return false;
        tryPressBackButton(false);
        pulseElement(characterPortrait);
        generateClick(characterPortrait);
    }
    return true;
}
;
function setFocusedCharacterIndex(index) {
    
}
;
function tryActivateSummonByIndex(index) {
    var selector = 'div.lis-summon[pos="' + (index + 1) + '"]';
    var icon = document.querySelector(selector);
    if (!icon) {
        console.log("No matching summon found");
        return false;
    }
    pulseElement(icon);
    generateClick(icon);
    return true;
}
;
function findSkillIcon(characterNumber, abilityNumber) {
    // FIXME: Only fetch icon for old skill system
    var className = "ability-character-num-" + characterNumber + "-" + abilityNumber;
    return document.querySelector("div." + className);
}
;
function tryGetParsedSkill(characterNumber, abilityNumber) {
    var result;
    if (currentSettings.newSkillSystem) {
        var absoluteCharacterIndex = combatState.characterIds.indexOf(combatState.party[characterNumber - 1].pid);
        var cs = serverSkillState[absoluteCharacterIndex];
        if (cs)
            result = cs[abilityNumber];
        if (result) {
            if (!result.button || !result.icon) {
                let icon = findSkillIcon(characterNumber, abilityNumber);
                result.button = icon.parentElement;
                result.icon = icon;
            }
            if (!result.iconUrl) {
                var iconImg = result.icon.querySelector("img");
                if (iconImg)
                    result.iconUrl = iconImg.src;
            }
            result.index = abilityNumber;
        }
        return result;
    }
    else {
        let icon = findSkillIcon(characterNumber, abilityNumber);
        if (!icon)
            return false;
        result = parseSkill(icon.parentNode, icon);
        if (result)
            result.index = abilityNumber;
        return result;
    }
}
;
function tryActivateAbilityByIndex(index) {
    var selectedCharacterNumber = getSelectedCharacterNumber();
    if (!selectedCharacterNumber) {
        log("No character selected");
        return false;
    }
    var parsed = tryGetParsedSkill(selectedCharacterNumber, index + 1);
    if (parsed) {
        pulseElement(parsed.icon);
        if (!normalAttacking) {
            var clickEvtResult = onQuickSkillClick.bind(parsed, { target: parsed.icon })();
            if (clickEvtResult !== false)
                generateClick(parsed.icon);
        }
        return true;
    }
    return false;
}
;
function updateQuickSummonPanel() {
    
}
;
var currentSkillStatus = {};
var previousPartyPids = {};
function processPartyMember(index, partyIcon, skillContainer, updateQuickPanels, pid) {

}
;
function trySelectNinjaMark(keyText) {
    var button = null;
    switch (keyText) {
        case "ARROWUP":
            button = document.querySelector("div.lis-ninja-mark.mark1");
            break;
        case "ARROWRIGHT":
            button = document.querySelector("div.lis-ninja-mark.mark2");
            break;
        case "ARROWLEFT":
            button = document.querySelector("div.lis-ninja-mark.mark3");
            break;
        case "ARROWDOWN":
            button = document.querySelector("div.lis-ninja-mark.mark4");
            break;
    }
    if (!button) {
        return false;
    }
    pulseElement(button);
    generateClick(button);
    return true;
}
function refreshPartyUI(partyIcons, skillContainers) {
    
}
function tickPartyUI(partyIcons, skillContainers) {

}
;
function isNinjaMarkPopupOpen() {
    return (document.querySelector("div.pop-usual.pop-ability-mark").style.display === "block");
}
function isAnkiPopupOpen() {
    return (document.querySelector("div.pop-usual.pop-ability-hiddenweapon").style.display === "block");
}
function isAnyPopupOpen() {
    var popups = document.querySelectorAll("div.pop-usual");
    for (var i = 0; i < popups.length; i++) {
        if (popups[i].style.display === "block") {
            return true;
        }
    }
    return false;
}
function fixSkillTouch(evt) {
    // resets a skill button back to its regular state if a touchend event is suppressed
    if (evt.type !== "touchend") {
        return;
    }
    if (evt.target.className.indexOf("ico-ability") < 0) {
        return;
    }
    var button = evt.target.parentElement;
    button.className = button.className.split(" ").filter(function (e) {
        return (e !== "on");
    }).join(" ");
}
var lastButtonLockChangeWhen = null;
function refreshButtonLock(btn, sinceLastChange) {
    var icon = btn.firstElementChild;
    if (!icon)
        return;
    if (!icon.hasAttribute("ability-id"))
        return;
    var re = /ability-character-num-([0-9])-([0-9])/;
    var m = re.exec(icon.className);
    if (!m)
        return;
    var characterNumber = parseInt(m[1]), abilityNumber = parseInt(m[2]);
    var parsed = tryGetParsedSkill(characterNumber, abilityNumber);
    if (!parsed)
        return;
    var id = parsed.id;
    var isDisabled = !isSkillAvailable(parsed);
    var recast = parsed.recast;
    var defaultRecast = parsed.cooldown;
    var expected = "div." + icon.className.replace(/ /g, ".");
    var isQueued = combatState.skillQueue.indexOf(expected) >= 0;
    var shouldBeDisabled = (recast > 0) ||
        Number.isNaN(recast) ||
        isQueued ||
        (currentSkillRequestId === id);
    if (!currentSettings.newSkillSystem) {
        if (successfulAbilityCasts.indexOf(id) >= 0)
            shouldBeDisabled = true;
    }
    if (defaultRecast === 0)
        shouldBeDisabled = false;
    btn.lastElementChild.style.display =
        !shouldBeDisabled ? "none" : "block";
    if (isDisabled && !shouldBeDisabled) {
        if (sinceLastChange < 250)
            return;
        // log("Re-enabled skill button", btn);
        btn.classList.remove("tmp-mask");
        lastButtonLockChangeWhen = performance.now();
    }
    else if (!isDisabled && shouldBeDisabled) {
        if (sinceLastChange < 250)
            return;
        // log("Disabled skill button", btn);
        btn.classList.add("tmp-mask");
        lastButtonLockChangeWhen = performance.now();
    }
}
;
function refreshButtonLocks() {
    if (!currentSettings.stuckButtonWorkaround2)
        return;
    if (!combatState)
        return;
    if (!combatState.skillQueue)
        return;
    var isCommandTopVisible = document.querySelector("div.prt-command-top").style.display !== "none";
    for (var i = 0, l = skillContainers.length | 0; i < l; i++) {
        var skillContainer = skillContainers[i];
        if (skillContainer.style.display !== "none") {
            // Fix cases where the party view and command view are
            //  both visible because of a swipe on a quick skill
            if (isCommandTopVisible) {
                skillContainer.style.display = "none";
            }
        }
    }
    var sinceLastChange = 999999;
    if (lastButtonLockChangeWhen)
        sinceLastChange = performance.now() - lastButtonLockChangeWhen;
    var buttons = document.querySelectorAll("div.lis-ability");
    for (var i = 0, l = buttons.length; i < l; i++)
        refreshButtonLock(buttons[i], sinceLastChange);
}
;
function getSkillState() {
    return JSON.parse(JSON.stringify(currentSkillStatus));
}
;
function parseServerPlayerState(playerStates, abilityState) {
    if (!abilityState) {
        log("Empty cooldown update?");
        return;
    }
    rawServerSkillState = abilityState;
    serverSkillState = Object.create(null);
    for (var k in rawServerSkillState) {
        let obj = rawServerSkillState[k];
        let absoluteCharacterIndex = obj.pos; // 0-5
        let ps = playerStates[absoluteCharacterIndex];
        let newObj = serverSkillState[absoluteCharacterIndex] = {};
        if (!ps) {
            log("WARNING: Missing entry for party member in network data");
            continue;
        }
        // HACK
        ps.condition.ability_available_flag =
            !(ps.condition.ability_available_flag === false);
        for (var j in obj.list) {
            let rawSkill = obj.list[j];
            let skill = parseSkillInner(k, function hc(className) {
                return (rawSkill[0].class.indexOf(className) >= 0) ||
                    (rawSkill[1].class.indexOf(className) >= 0);
            }, function gia(attributeName) {
                var result = rawSkill[0][attributeName];
                if (result === undefined)
                    result = rawSkill[1][attributeName];
                return result;
            });
            newObj[j] = skill;
        }
    }
}
;
function isSkillAvailable(parsedSkill) {
    if (parsedSkill.recast > 0)
        return false;
    var ps = combatState.party[parsedSkill.characterNumber - 1];
    if (!ps.condition.ability_available_flag)
        return false;
    return true;
}
;
//# sourceMappingURL=skills.js.map