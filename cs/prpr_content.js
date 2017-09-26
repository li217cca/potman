

const conn = chrome.runtime.connect()

conn.onMessage.addListener(event => {
    switch (event.type) {
        case "connSuccess": {
            conn.postMessage({type: "prprConn"})
            break
        }
    }
})


const tryJoinRaid = (code) => {
    if (typeof code !== "string" || code.length !==8) return
    console.log("try join raid", code)

    var options = {
        cache: false,
        global: false,
        data: { special_token: null, battle_key: code },
        method: "POST"
    }
    $.ajax("http://game.granbluefantasy.jp/quest/battle_key_check", JSON.stringify(options)).then(resp => {


        conn.postMessage({type: "checkBattleKey", resp: resp})
    })
}

addEventListener("copy", event => {
    
    conn.postMessage({type: "copyRaid", raidCode: event.target.value})
    // tryJoinRaid(event.target.value)
})