
const default_state = {
    run: true,     // all run need, exceipt log
    observe: true, // observer run need
    speed: 1,      
    prpr: false,
    prpr_auto: false,
    captcha: false,
    error: false,
    coop: {
        run: false,
        first: false
    },
    auto_battle: false,
    auto_confirm_pending: false,
    // listen: {
    //     repeat: true,
    //     attack: true,
    //     skill: false,
    //     result: true,
    //     coop: true,
    //     prepare: true,
    //     start: true
    // }
}

// TODO
// const event = {
//     CONN_SUCCESS: "CONN_SUCCESS",

//     PRPR_CODE_COPY: "PRPR_CODE_COPY",
//     PRPR_CODE_LISTEN: "PRPR_CODE_LISTEN", 
// }