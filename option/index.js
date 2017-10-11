

const Input = (props, children) => E("input", props, children)
const E = React.createElement
const Div = (props, children) => React.createElement("div", props, children)
const Button = (props, children) => React.createElement("button", props, children)
const Select = (props, children) => React.createElement("select", props, children)
const Option = (props, children) => React.createElement("option", props, children)
class Main extends React.Component {
    constructor (props) {
        super(props)
        const conn = chrome.runtime.connect()
        conn.onMessage.addListener(event => {
            switch (event.type) {
                case evt.CONN_SUCCESS: {
                    conn.postMessage({type: evt.REQUIRE_STATE})
                    break
                }
                case evt.GET_STATE: {
                    console.log("GET_STATE", event)
                    this.setState({state: event.state})
                    this.setState({conn: conn})
                    break
                }
            }
        })
        this.state = {
            state: {}, 
            conn: false
        }
    }
    render () {
        if (!this.state.conn) {
            return Div(null, "loading...")
        }
        const postSetState = (state) => {
            this.state.conn.postMessage({
                type: evt.SET_STATE,
                state: state
            })
        }

        let {auto_battle_script_id, battle_scripts} = this.state.state
        if (battle_scripts instanceof Array) {
            const tmp = {}
            battle_scripts.forEach(item => {
                tmp[item.ID] = item
            })
            battle_scripts = tmp
            postSetState({battle_scripts: battle_scripts})
        }
        const newScript = () => {
            const script_id = parseInt(Math.random() * 1234579)
            battle_scripts[script_id] = {
                ID: script_id,
                name: "未命名脚本_" + script_id,
                boss_pos: 0,
                battle: {
                    stage: [[], [], [], [], []]
                },
                deck: {
                    groupID: 1,
                    number: 1,
                    supporter: []
                }
            }
            postSetState({battle_scripts: battle_scripts, auto_battle_script_id: script_id})
        }
        const deleteThis = () => {
            delete battle_scripts[auto_battle_script_id]
            let key = 0
            for (key in battle_scripts) if (key !== "map") break
            if (key === "map") key = 0
            console.log(battle_scripts[key])
            postSetState({battle_scripts: battle_scripts, auto_battle_script_id: key})
        }
        const autoBattleScript = battle_scripts[auto_battle_script_id]
        battle_scripts.map = (cb) => {
            const resp = []
            for (let key in battle_scripts) {
                if (key !== "map") {
                    resp.push(cb(battle_scripts[key], key))
                }
            }
            return resp
        }

        const autoBattleOnChange = (script) => {
            battle_scripts[auto_battle_script_id] = script
            postSetState({battle_scripts: battle_scripts})
        }
        return (
            React.createElement("div", null, [
                React.createElement("div", null, "科技罐头人"),
                Div(null, 
                    Select({value: auto_battle_script_id,onChange: (event) => {
                        console.log("onchange", event.target.value)
                        postSetState({auto_battle_script_id: event.target.value})
                    }}, battle_scripts.map(script => {
                        return Option({value: script.ID}, script.name)
                    })),
                ),
                Button({onClick: newScript}, "newScript"),
                Button({onClick: deleteThis}, "deleteThis"),
                // Button({onClick: resetBattle}, "resetBattle"),
                React.createElement(AutoBattle, {script: autoBattleScript, onChange: autoBattleOnChange})
            ])
        )
        
    }
}

ReactDOM.render(
    React.createElement(Main, null, null),
    document.getElementById('root')
)