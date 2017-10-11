
const default_state = {
    halt: false,

    run: true,
    prpr: false,
    prpr_auto: false,
    prpr_deck: [3, 1],
    prpr_supporter: ["カグヤ", "ホワイトラビット"],
    prpr_attack: true,
    coop_run: false,
    coop_first: false,
    auto_battle: false,
    auto_battle_url: "",
    auto_battle_script_id: null,
    battle_scripts: {},
    auto_confirm_pending: false,

    ap: 0,
    bp: 0,
    lock: false,
    pending_battle: 0,

    dev: false
}

// TODO
const evt = {
    BOSS_DIE: "BOSS_DIE",
    BATTLE_WIN: "BATTLE_WIN",

    ACTION_PRESS: "ACTION_PRESS",                           // string
    ACTION_POPUP: "ACTION_POPUP",                           // {msg: string, [ms: int]}
    ACTION_LOG: "ACTION_LOG",                               // ...args

    ACTION_WAIT_ELEMENT: "ACTION_WAIT_ELEMENT",
    ACTION_WAIT_REDIRECT: "ACTION_REDIRECT",                // string
    ACTION_WAIT_LOADING: "ACTION_WAIT_LOADING",             // () =>
    ACTION_WAIT_PRESS: "ACTION_WAIT_PRESS",                 // string =>
    ACTION_WAIT_PRESS_AUTO: "ACTION_WAIT_PRESS_AUTO",
    ACTION_WAIT_PRESS_SKILL: "ACTION_WAIT_PRESS_SKILL",
    ACTION_WAIT_PRESS_SUMMON: "ACTION_WAIT_PRESS_SUMMON",
    ACTION_WAIT_SELECT_SUPPORTER: "ACTION_WAIT_SELECT_SUPPORTER",
    ACTION_WAIT_SELECT_DECK: "ACTION_WAIT_SELECT_DECK",
    ACTION_WAIT_JOIN_RAID: "ACTION_WAIT_JOIN_RAID",
    ACTION_WAIT_CONFIRM_PENDING_BATTLE: "ACTION_WAIT_CONFIRM_PENDING_BATTLE",

    CONN_SUCCESS: "CONN_SUCCESS",
    MAIN_CHANNEL: "MAIN_CHANNEL",

    EXTERNAL_INIT: "EXTERNAL_INIT",
    EXTERNAL_SUCCESS: "EXTERNAL_SUCCESS",
    EXTERNAL_LOG: "EXTERNAL_LOG",

    AJAX_BEGIN: "AJAX_BEGIN",
    AJAX_COMPLETE: "AJAX_COMPLETE",

    DO_AJAX: "DO_AJAX",
    DO_POPUP: "DO_POPUP",
    DO_CLICK: "DO_CLICK",
    DO_AJAX_RESULT: "DO_AJAX_RESULT",

    WEBSOCKET_RECEIVED: "WEBSOCKET_RECEIVED",

    REQUIRE_STATE: "REQUIRE_STATE",
    GET_STATE: "GET_STATE",
    SET_STATE: "SET_STATE",

    GET_RAID_ID_FROM_COPY: "GET_RAID_ID_FROM_COPY",
    GET_RAID_ID_FROM_LISTEN: "GET_RAID_ID_FROM_LISTEN", 

    ERROR: "ERROR",
}