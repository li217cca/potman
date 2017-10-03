onload = () => {
    console.log("onload..")
    const conn = chrome.runtime.connect()

    conn.onMessage.addListener(event => {
        switch (event.type) {
            case evt.CONN_SUCCESS: {
                conn.postMessage({type: "prprConn"})
                break
            }
        }
    })

    const cols = document.querySelectorAll(".gbfrf-column")
    cols.forEach(col => {
        let listen = false
        const button = document.createElement("div")
        button.innerText = "自动✕"
        button.style.zIndex = 9999
        button.style.position = "absolute"
        button.style.background = "#111"
        button.style.borderRadius = "4px"
        button.style.right = "40px"
        button.onclick = () => {
            listen = !listen
            button.innerText = listen ? "自动〇" : "自动✕"
        }
        const header = col.querySelector(".mdl-layout__header-row.gbfrf-column__header-row")
        header.appendChild(button)
        const title = header.querySelector(".gbfrf-column__header-name").innerText

        const callback = (record) => {
            if (!listen) return
            record.forEach(rec => {
                if (!rec.target.attributes) return
                if (!rec.target.attributes["data-raidid"]) return
                const raid_id = rec.target.attributes["data-raidid"].value
                if (!idMap.has(raid_id)) {
                    idMap.add(raid_id)
                    console.log("listen " + title, raid_id)
                    conn.postMessage({type: evt.GET_RAID_ID_FROM_LISTEN, raid_id: raid_id})
                }
            })
        }
        const observer = new MutationObserver(callback)
        const list = col.querySelector(".mdl-list.gbfrf-tweets")
        observer.observe(list, {childList: true, subtree: true})
        const idMap = new Set()
        list.childNodes.forEach(item => {
            if (!item.attributes) return
            const raid_id = item.attributes["data-raidid"].value
            idMap.add(raid_id)
        })
    })

    addEventListener("copy", event => {
        
        conn.postMessage({type: evt.GET_RAID_ID_FROM_COPY, raid_id: event.target.value})
        // tryJoinRaid(event.target.value)
    })
}
