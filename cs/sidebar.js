/**
 * Created by cifer on 2017/9/18.
 */
"use strict";
var raidListUpdateInterval = 30000;
var raidListUpdateBackoff = 1350;
var raidListUpdateCounter = 25;
var statusPanelUpdateIntervalSeconds = 30;
var minimumBuffUpdateIntervalSeconds = 70;
var currentRaidListUpdateInterval = raidListUpdateInterval;
var invalidateRaidList = null, doUpdateRaidsPanel = null;
var updateBuffsWhen = 0, isUpdatingBuffs = false;
var queuedRaidClick = null;
var nextRaidUpdateWhen = null;
var menuIconSize = 0;
var menuLeftEdge = 0;
var subpanelOffset = 0;
var mostRecentItems = null;
var lastPlayerStatus = null;
var statusIntervalH, raidTimerIntervalH;
var allBookmarks = {};
function bookmarkNavigate(target, evt) {
    var inNewWindow = false;
    if (evt) {
        inNewWindow = (evt.button === 1) ||
            !!evt.shiftKey;
    }
    if (inNewWindow) {
        // HACK: Fully resolve the URL
        var elt = document.createElement("a");
        elt.href = target;
        chrome.runtime.sendMessage({ type: "openNewTab", url: elt.href });
    }
    else {
        chrome.runtime.sendMessage({ type: "setLastLocation", url: target });
        window.location.href = target;
    }
}
;
function repeatLastQuest(evt, callback) {
    chrome.runtime.sendMessage({ type: "getRecentQuest" }, function (recentQuestJson) {
        if (!recentQuestJson) {
            if (callback)
                callback(false, "No recent quest to attempt");
            else
                return showBookmarkError("No recent quest to attempt.");
        }
        var recentQuest;
        try {
            recentQuest = JSON.parse(recentQuestJson);
        }
        catch (exc) {
            if (callback)
                callback(false, "No recent quest to attempt");
            else
                return showBookmarkError("No recent quest to attempt.");
        }
        var parts = splitQuestId(recentQuest.quest_id);
        var chapterId = parts[0];
        var suffix = parts[1];
        var itemId = recentQuest.use_item_id;
        if (itemId)
            itemId = parseInt(itemId);
        else
            itemId = undefined;
        var data = makeBookmarkCore(chapterId, suffix, recentQuest.quest_type, itemId, recentQuest.prefix);
        checkQuestStart(data, function (ok, result, reason) {
            if (ok) {
                bookmarkNavigate(data.targetUrl, evt);
                setTimeout(function () {
                    if (callback)
                        callback(true);
                    window.location.reload();
                }, 50);
            }
            else {
                if (callback)
                    callback(false, reason);
                else
                    return showBookmarkError(reason);
            }
        });
    });
}
;
function makeBookmarkCore(chapterId, questSuffix, questType, useItemId, urlPrefix) {
    var questId = String(chapterId) + String(questSuffix);
    if (!urlPrefix) {
        urlPrefix = "/#quest";
    }
    var targetUrl = urlPrefix + "/supporter/" + questId + "/" + questType;
    if (useItemId)
        targetUrl += "/0/" + useItemId;
    var infoUrl = "/quest/treasure_raid/" + chapterId + "/" + questId;
    // FIXME: The /1/ here is the raid type
    var checkStartUrl = "/quest/check_quest_start/" + chapterId + "/1/" + questId;
    return {
        chapterId: chapterId,
        questId: questId,
        targetUrl: targetUrl,
        infoUrl: infoUrl,
        checkStartUrl: checkStartUrl
    };
}
;
function showBookmarkError(message, extra) {
    showGamePopup({
        title: "Bookmark",
        body: message + (extra ? "<br>" + String(extra) : "")
    });
}
;
function startRaid(data, evt) {
    log("Starting raid", data.targetUrl);
    bookmarkNavigate(data.targetUrl, evt);
}
;
function checkQuestStart_old(data, onSuccess) {
    checkQuestStart(data, function (ok, eligibility, reason) {
        if (ok)
            onSuccess(data, eligibility);
        else
            showBookmarkError(reason);
    });
}
function checkQuestStart(data, callback) {
    log("Checking eligibility", data.checkStartUrl);
    doClientAjax(data.checkStartUrl, function (eligibility, error) {
        if (!eligibility)
            return showBookmarkError("Failed to get information from server", error);
        switch (eligibility.result) {
            case "ok":
                callback(true, eligibility);
                return;
            case "error_cnt":
                callback(false, eligibility, "You have already attempted this raid the maximum number of times today.");
                return;
            case "other_quest_progress":
                callback(false, eligibility, "You cannot start this raid because another quest is in progress.");
                return;
            case "error_level":
                callback(false, eligibility, "Your rank is too low to start this raid.");
                return;
            default:
                try {
                    var blob = JSON.parse(eligibility);
                    if (blob.popup && blob.popup.body) {
                        callback(false, eligibility, blob.popup.body);
                        return;
                    }
                }
                catch (exc) {
                    callback(false, eligibility, "Unknown error");
                }
        }
    });
}
;
function makeRaidBookmark(chapterId, questSuffix) {
    var data = makeBookmarkCore(chapterId, questSuffix, 1);
    return function (evt) {
        checkQuestStart_old(data, function (data, eligibility) {
            startRaid(data, evt);
        });
    };
}
;
function getRaidInfo(data, onSuccess) {
    log("Requesting raid info", data.infoUrl);
    doClientAjax(data.infoUrl, function (raidInfo, error) {
        if (!raidInfo)
            return showBookmarkError("Failed to get information from server", error);
        onSuccess(data, raidInfo);
    });
}
;
function makeTreasureRaidBookmark(chapterId, questSuffix, itemId) {
    var data = makeBookmarkCore(chapterId, questSuffix, 1, itemId);
    return function (evt) {
        getRaidInfo(data, function (data, raidInfo) {
            var treasureIndex = raidInfo.treasure_id.indexOf(String(itemId));
            if (treasureIndex < 0)
                return showBookmarkError("Item not found in raid info");
            var itemsNeeded = parseInt(raidInfo.consume[treasureIndex]);
            var itemsHeld = raidInfo.num[treasureIndex];
            if (itemsHeld < itemsNeeded)
                return showBookmarkError(raidInfo.chapter_name + " requires " +
                    itemsNeeded + " of " +
                    raidInfo.treasure_name[treasureIndex] +
                    ", but you only have " + itemsHeld);
            checkQuestStart_old(data, function (data, eligibility) {
                startRaid(data, evt);
            });
        });
    };
    /*
     {
     "chapter_id":"30005",
     "quest_id":"300051",
     "type":"1",
     "action_point":"50",
     "chapter_name":"Tiamat Omega Showdown",
     "consume":["3"],
     "level":30,
     "treasure_id":["18"],
     "treasure_image_id":["18"],
     "treasure_name":["Tiamat Omega Anima"],
     "num":[26],
     "raid_name":"Lvl 50 Tiamat Omega",
     "limit":90
     }
     */
}
;
function visitCurrentEvent(evt, tail) {
    chrome.runtime.sendMessage({ type: "getCurrentEvent" }, function (currentEvent) {
        if (!currentEvent)
            showGamePopup({
                title: "Error",
                body: "No event stored. Try visiting the main page."
            });
        else if (tail)
            bookmarkNavigate("/#" + currentEvent + tail, evt);
        else
            bookmarkNavigate("/#" + currentEvent, evt);
    });
}
;
function makeGuildWarBookmark(tail) {
    return function (evt) {
        bookmarkNavigate("/#event/" + guildWarName + (tail || ""), evt);
    };
}
;
function makeGuildWarRaidBookmark(chapterId, questSuffix, checkItem) {
    var data = makeBookmarkCore(chapterId, questSuffix, 1);
    var visitSupporterPage = function (evt) {
        data.targetUrl = data.targetUrl.replace("#quest/", "#event/" + guildWarName + "/");
        checkQuestStart_old(data, function (data, eligibility) {
            startRaid(data, evt);
        });
    };
    if (!checkItem)
        return visitSupporterPage;
    return function (evt) {
        var checkUrl = "/" + guildWarName + "/top/check_item/" + data.questId;
        doClientAjax(checkUrl, function (checkResult) {
            if (checkResult && checkResult.result)
                return visitSupporterPage(evt);
            else
                return showBookmarkError("You do not have the necessary items to start this quest.");
        });
    };
}
;
function makeEventTreasureRaidBookmark(chapterId, questSuffix) {
    return function (evt) {
        chrome.runtime.sendMessage({ type: "getCurrentEvent" }, function (currentEvent) {
            if (!currentEvent)
                showGamePopup({
                    title: "Error",
                    body: "No event stored. Try visiting the main page."
                });
            var data = makeBookmarkCore(chapterId, questSuffix, 1);
            data.targetUrl = data.targetUrl.replace("#quest/", "#" + currentEvent + "/");
            checkQuestStart_old(data, function (data, eligibility) {
                startRaid(data, evt);
            });
        });
    };
}
;
var guildWarName = null;
var guildWarSubmenu = {
    "guild-war-home": makeGuildWarBookmark(),
    "guild-war-gacha": makeGuildWarBookmark("/gacha/index"),
    "guild-war-reward": makeGuildWarBookmark("/reward"),
    //"guild-war-eye-vh": makeGuildWarRaidBookmark(71863, 1, false),
    "guild-war-dog-vh": makeGuildWarRaidBookmark(72034, 1, false),
    "guild-war-dog-ex": makeGuildWarRaidBookmark(72035, 1, false),
    "guild-war-dog-ex-plus": makeGuildWarRaidBookmark(72036, 1, false),
    "guild-war-hell-90": makeGuildWarRaidBookmark(72037, 1, true),
    "guild-war-hell-95": makeGuildWarRaidBookmark(72038, 1, true),
};
var menuItems = {
    "home": "/#mypage",
    "party": "/#party/index/0/npc/0",
    "mystuff": {
        "inventory": "/#list",
        "stash": "/#container",
        "crate": "/#present",
        "supplies": "/#item",
    },
    "quest": {
        "quest-all": "/#quest/index",
        "quest-special": "/#quest/extra",
        "join-raid": "/#quest/assist",
        "event": visitCurrentEvent,
        "trial-battles": "/#trial_battle",
        "pending-raids": "/#quest/assist/unclaimed",
    },
    "quest-repeat": repeatLastQuest,
    // "guild-war": guildWarSubmenu,
    "hard-raids": {
        "hard-tia": makeRaidBookmark(30004, 1),
        "hard-colo": makeRaidBookmark(30009, 1),
        "hard-levi": makeRaidBookmark(30015, 1),
        "hard-yugu": makeRaidBookmark(30019, 1),
        "hard-chev": makeRaidBookmark(30022, 1),
        "hard-cel": makeRaidBookmark(30025, 1)
    },
    "magna-raids": {
        "magna-tia": makeTreasureRaidBookmark(30005, 1, 18),
        "magna-colo": makeTreasureRaidBookmark(30010, 1, 19),
        "magna-levi": makeTreasureRaidBookmark(30016, 1, 20),
        "magna-yugu": makeTreasureRaidBookmark(30026, 1, 21),
        "magna-chev": makeTreasureRaidBookmark(30027, 1, 26),
        "magna-cel": makeTreasureRaidBookmark(30028, 1, 31)
    },
    "hl-raids": {
        "hl-tia": makeTreasureRaidBookmark(30044, 1, 32),
        "hl-colo": makeTreasureRaidBookmark(30049, 1, 47),
        "hl-levi": makeTreasureRaidBookmark(30051, 1, 48),
        "hl-yugu": makeTreasureRaidBookmark(30053, 1, 49),
        "hl-chev": makeTreasureRaidBookmark(30056, 1, 50),
        "hl-cel": makeTreasureRaidBookmark(30058, 1, 51),
        "hl-rosequeen": makeTreasureRaidBookmark(30047, 1, 1204),
    },
    "primal-raids": {
        "nataku": makeTreasureRaidBookmark(30042, 1, 1343),
        "flame-glass": makeTreasureRaidBookmark(30041, 1, 1313),
        "macula-marius": makeTreasureRaidBookmark(30038, 1, 1323),
        "athena": makeTreasureRaidBookmark(30107, 1, 1313),
        "medusa": makeTreasureRaidBookmark(30039, 1, 1333),
        "apollo": makeTreasureRaidBookmark(30043, 1, 1353),
        "olivia": makeTreasureRaidBookmark(30040, 1, 1363),
        "odin": makeTreasureRaidBookmark(30046, 1, 1353),
    },
    "coop": {
        "coop": "/#coopraid",
        // This makes it impossible to return to an existing room
        // "coop-host": "/#coopraid/room/entry",
        "coop-join": "/#coopraid/offer",
        "coop-shop": "/#coopraid/lineup"
    },
    "me": {
        "profile": "/#profile",
        "crew": "/#guild",
        "friends": "/#friend",
        "trophies": "/#title"
    },
    "shop": {
        "shop-mobacoins": "#shop/moba/0",
        "shop-crystals": "#shop/lupi/0",
        "shop-points": "/#shop/exchange/points",
        "shop-trajectory": "#shop/exchange/trajectory",
        "shop-moon": "#shop/exchange/moon",
        "shop-treasure": "#shop/exchange/list",
        "shop-whale-tears": "#shop/exchange/ceiling",
        "shop-weapon-series": "#archaic",
    },
    "casino": {
        "poker": "/#casino/list/poker",
        "bingo": "/#casino/list/bingo",
        "casino-shop": "/#casino/exchange"
    },
};
var viramateMenuItems = {
    "settings": function () {
        var loc = chrome.extension.getURL("src/options_custom/index.html");
        var w = window.open(loc);
    },
    "update-notes": function () {
        var loc = chrome.extension.getURL("content/changelog.html");
        var w = window.open(loc);
    }
};
function isHorizontalLayout() {
    return (isMobileSite() ||
    !!currentSettings.horizontalBookmarks ||
    !!document.getElementById("gree-game-container"));
}
;
function makeMenuHandler(name, value, tryCloseMenu) {
    var result;
    if (typeof (value) === "string")
        result = function (evt) {
            if (evt) {
                evt.preventDefault();
                evt.stopPropagation();
            }
            tryCloseMenu();
            bookmarkNavigate(value, evt);
        };
    else if (value && value.call && value.apply)
        result = function (evt) {
            if (evt) {
                evt.preventDefault();
                evt.stopPropagation();
            }
            tryCloseMenu();
            value(evt);
        };
    else
        return null;
    allBookmarks[name] = result;
    return result;
}
;
function _updateIconSize(menuIcon) {
    if (isHorizontalLayout())
        menuIcon.style.left = menuLeftEdge.toFixed(0) + "px";
    else
        menuIcon.style.left = "-6px";
    var iconRect = menuIcon.getBoundingClientRect();
    if (isHorizontalLayout())
        menuIconSize = iconRect.width * getEffectiveZoom(menuIcon) * getEffectiveZoom(document.documentElement);
    else
        menuIconSize = iconRect.height * getEffectiveZoom(menuIcon);
}
;
function getColorForMenuItem(key) {
    switch (key) {
        case "hard-raids":
            return "#efc0ba";
        case "magna-raids":
            return "#e8e8f1";
        case "hl-raids":
            return "#efe0ba";
    }
    var dashPos = key.lastIndexOf("-");
    var suffix = key.substr(dashPos + 1);
    switch (suffix) {
        case "tia":
            return "#bfefbf";
        case "yugu":
            return "#efdfa0";
        case "colo":
            return "#efbfbf";
        case "levi":
            return "#bfcfef";
        case "cel":
            return "#d890df";
    }
    return null;
}
;
function __showViraButton() {
    if (isShutdown)
        return;
    injectStylesheet("sidebar-shadow.css", getUiContainer());
    var outImg = getResourceUrl('vira-small-smile.png');
    var overImg = getResourceUrl('vira-small.png');
    var isCustomIcon = false;
    try {
        if (currentSettings.bookmarksInactiveIcon)
            outImg = encoding.Base64.stringToImageURL(currentSettings.bookmarksInactiveIcon);
        if (currentSettings.bookmarksActiveIcon)
            overImg = encoding.Base64.stringToImageURL(currentSettings.bookmarksActiveIcon);
        isCustomIcon = (currentSettings.bookmarksActiveIcon || currentSettings.bookmarksInactiveIcon);
    }
    catch (exc) {
        log("Error decoding custom bookmarks icons", exc);
    }
    // HACK: Why is this necessary?
    var maxIconWidth = isCustomIcon ? 64 : 56;
    // HACK: :after selectors don't work on img. html sucks.
    var paddingSize = 100;
    if (typeof (currentSettings.bookmarksIconPadding) === "number")
        paddingSize = currentSettings.bookmarksIconPadding;
    var mouseIsOverIcon = false;
    var mouseIsOverMenu = 0;
    var mouseIsOverSubmenu = 0;
    var menuIsVisible = false;
    var autoOpenDelay = isHorizontalLayout() ? 260 : 160;
    var autoCloseDelay = currentSettings.openBookmarksOnClick ? 500 : 250;
    var pamrklamr = function () {
        return 5 * 1000 + (Math.random() * 1600 * 1000);
    };

    var isGuildWar = currentSettings.currentGuildWar &&
        (currentSettings.currentGuildWar.indexOf("event/teamraid") === 0);
    if (isGuildWar)
        guildWarName = currentSettings.currentGuildWar.replace("event/", "");
    allBookmarks = {};
    var populateSubmenu;
    populateSubmenu = function (container, items, isSubmenu, extraClassNames) {
        if (isSubmenu) {
            if (Object.keys(items).length > 4)
                container.style.columnCount = "2";
        }
        for (var k in items) {
            if (!items.hasOwnProperty(k))
                continue;
            var v = items[k];
            // HACK: Only show guild war submenu during guild war
            if ((v === guildWarSubmenu) &&
                !isGuildWar)
                continue;
            var elt = document.createElement("li");
            elt.className = "viramate-menu-item";
            if (extraClassNames)
                elt.className += " " + extraClassNames;
            elt.setAttribute("key", k);
            var label = i18n.get("m-" + k);
            elt.textContent = label;
            var color = getColorForMenuItem(k);
            if (color)
                elt.style.color = color;
            if (v && (typeof (v) === "object")) {
                // Submenu
                elt.className += " has-submenu";
                var submenu = document.createElement("ul");
                submenu.className = "viramate-submenu";
                populateSubmenu(submenu, v, true);
                container.appendChild(submenu);
            }
            else {
                // Item
            }
            container.appendChild(elt);
        }
        ;
    };
    var ul = document.createElement("ul");
    populateSubmenu(ul, menuItems, false);
    var langSelectorEn = document.createElement("li");
    var langSelectorJp = document.createElement("li");
    langSelectorEn.className = "language-menu-item en";
    langSelectorJp.className = "language-menu-item jp";
    langSelectorEn.textContent = "English";
    langSelectorJp.textContent = "日本語";
    langSelectorEn.title = langSelectorJp.title = i18n.get("m-set-language");
    langSelectorEn.addEventListener("click", makeLanguageSetter(2), true);
    langSelectorJp.addEventListener("click", makeLanguageSetter(1), true);
    ul.appendChild(langSelectorEn);
    ul.appendChild(langSelectorJp);
    /*
     var showPopoutItem = document.createElement("li");
     showPopoutItem.className = "viramate-menu-item";
     showPopoutItem.textContent = "Open popout";
     showPopoutItem.addEventListener("click", showPopout, true);
     ul.appendChild(showPopoutItem);
     */
    var versionText = document.createElement("span");
    versionText.className = "viramate-version";
    ul.appendChild(versionText);
    populateSubmenu(ul, viramateMenuItems, false, "small");
    if (isHorizontalLayout()) {
        var trySpawn = function () {
            if (isShutdown)
                return true;
            var gameContainer = getGameContainer();
            var wrapper = gameContainer.querySelector(".wrapper");
            if (!gameContainer || !wrapper)
                return false;
            var effectiveZoom = getEffectiveZoom(gameContainer);
            var documentZoom = getEffectiveZoom(document.documentElement);
            menuLeftEdge = parseFloat(wrapper.parentNode.getAttribute("data-show-menubar-width")) || 0;
            var effectiveSidebarHeight = 48;
            if (isMobileSite()) {
                effectiveSidebarHeight /= documentZoom;
                getOverlayContainer().style.zoom = (1 / documentZoom).toFixed(3);
            }
            wrapper.style.marginTop = (effectiveSidebarHeight / effectiveZoom).toFixed(0) + "px";
            return true;
        };
        if (!trySpawn())
            window.setTimeout(trySpawn, 500);
    }
    chrome.runtime.sendMessage({ type: "getVersion" }, function (version) {
        var text = "Viramate " + version;
        if (isMobileSite())
            text += " (mobile)";
        versionText.textContent = text;
    });
}
;
var primeHaloRequestIsPending = false;
var primeHaloStartsWhen = null, primeHaloStartsWhenText = null;
var needHaloPanelLayout = false;
function navigateToExtraQuests() {
    window.location.href = "/#quest/extra";
}
;
function updateClock(element) {
    var jstHourMinute = {
        timeZone: "Asia/Tokyo",
        hour12: false,
        hour: "2-digit",
        minute: "2-digit"
    };
    var text = new Date().toLocaleString("ja-JP", jstHourMinute) + " JST";
    var timeText = element.time;
    if (!timeText) {
        element.time = timeText = document.createElement("span");
        element.appendChild(timeText);
    }
    var c = (currentSettings.clockBrightness * 255).toFixed(0);
    var ct = "rgb(" + c + ", " + c + ", " + c + ")";
    timeText.style.color = ct;
    timeText.textContent = text;

    if (needHaloPanelLayout) {
        needHaloPanelLayout = false;
    }
}
;
function showRaidsPanel(uid) {
    
}
;
function maybeScheduleNextRaidUpdate(panel) {
    
}
;
function shouldShowRaidsPanel() {
    
}
;
function isJoined(raid) {
    return raid["data-raid-type"] === 0;
}
;
function raidJoinHandler(evt) {
    doJoinRaid(evt, this);
    evt.preventDefault();
}
;
function doJoinRaid(evt, raid) {
    var inNewWindow = false;
    if (evt) {
        inNewWindow = (evt.button === 1) ||
            !!evt.shiftKey;
    }
    if (inNewWindow) {
        // HACK: Fully resolve the URL
        var elt = document.createElement("a");
        elt.href = "/#quest/assist";
        chrome.runtime.sendMessage({ type: "openNewTab", url: elt.href });
    }
    else {
        window.location.href = "/#quest/assist";
    }
}
;
function findItemInfo(predicate, arg) {
    if (!mostRecentItems)
        return false;
    for (var i = 0, l = mostRecentItems.length; i < l; i++) {
        var item = mostRecentItems[i];
        if (predicate(item, arg))
            return item;
    }
    return false;
}
;
function makeLanguageSetter(languageId) {
    return function (e) {
        e.preventDefault();
        doClientAjax("/setting/save", JSON.stringify({ special_token: null, language_type: String(languageId) }), function (result, error) {
            if (error)
                showGamePopup("Failed to set language");
            else
                log("Language set successfully");
        });
    };
}
;
//# sourceMappingURL=sidebar.js.map