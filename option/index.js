

const Input = (props, children) => E("input", props, children)
const E = React.createElement
const Div = (props, children) => React.createElement("div", props, children)
const Button = (props, children) => React.createElement("button", props, children)
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
        const resetBattle = () => {
            if (!auto_battle_script_id) {
                console.log("cant find auto battle script id =", auto_battle_script_id)
                auto_battle_script_id = battle_scripts.length
            }
            battle_scripts.push({
                ID: auto_battle_script_id,
                name: "未命名脚本",
                battle: {
                    stage: [[], [], [], [], []]
                },
                deck: {
                    groupID: 1,
                    number: 1,
                    supporter: []
                }
            })
            postSetState({auto_battle_script_id: auto_battle_script_id, battle_scripts: battle_scripts})
        }
        if (!battle_scripts[auto_battle_script_id]) {
            resetBattle()
            return Div(null, "loading...")
        }
        const autoBattleScript = battle_scripts[auto_battle_script_id]
        const autoBattleOnChange = (script) => {
            this.state.state.battle_scripts[auto_battle_script_id] = script
            postSetState({battle_scripts: this.state.state.battle_scripts})
        }
        return (
            React.createElement("div", null, [
                React.createElement("div", null, "科技罐头人"),
                Button({onClick: resetBattle}, "resetBattle"),
                React.createElement(AutoBattle, {script: autoBattleScript, onChange: autoBattleOnChange})
            ])
        )
        
    }
}

ReactDOM.render(
    React.createElement(Main, null, null),
    document.getElementById('root')
)