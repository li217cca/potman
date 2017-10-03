
const default_state = {
    run: true,
    prpr: false,
    prpr_auto: false,
    coop_run: false,
    coop_first: false,
    auto_battle: false,
    auto_confirm_pending: false
}

// TODO
const evt = {
    CONN_SUCCESS: "CONN_SUCCESS",

    EXTERNAL_INIT: "EXTERNAL_INIT",
    EXTERNAL_SUCCESS: "EXTERNAL_SUCCESS",
    EXTERNAL_LOG: "EXTERNAL_LOG",

    AJAX_BEGIN: "AJAX_BEGIN",
    AJAX_COMPLETE: "AJAX_COMPLETE",

    DO_AJAX: "DO_AJAX",
    DO_AJAX_RESULT: "DO_AJAX_RESULT",

    WEBSOCKET_RECEIVED: "WEBSOCKET_RECEIVED",

    REQUIRE_STATE: "REQUIRE_STATE",
    GET_STATE: "GET_STATE",
    SET_STATE: "SET_STATE",

    GET_RAID_ID_FROM_COPY: "GET_RAID_ID_FROM_COPY",
    GET_RAID_ID_FROM_LISTEN: "GET_RAID_ID_FROM_LISTEN", 

    ERROR: "ERROR",
}