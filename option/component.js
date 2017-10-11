
class BattleScript extends React.Component {
    render () {
        const {battle, onChange} = this.props
        return (
            Div(null, battle.stage.map((stage, num) => {
                return Div(null, [
                    Div(null, "stage" + (num + 1)),
                    stage.map((method, key) => {
                        return Div(null, [
                            Input({value: method, onChange: e => {
                                stage[key] = e.target.value
                                onChange(battle)
                            }}),
                            Button({onClick: () => {
                                battle.stage[num] = stage.filter(m => m !== method)
                                onChange(battle)
                            }}, "delete")
                        ])
                    }),
                    Div(null, 
                        Button({onClick: () => {
                            battle.stage[num].push("")
                            onChange(battle)
                        }}, "new")
                    )
                ])
            }))
        )
    }
}
class DeckScript extends React.Component {
    render () {
        const {deck, onChange} = this.props
        const onGroupIDChange = e => {
            onChange({...deck, groupID: parseInt(e.target.value)})
        }
        const onNumberChange = e => {
            onChange({...deck, number: parseInt(e.target.value)})
        }
        const onSupporterChange = e => {
            const s = e.target.value
            onChange({...deck, supporter: s.split(" ").filter(key => key.length > 0)})
        }
        return (
            Div(null, [
                Div(null, [
                    "队伍ID：",
                    Input({type: "number", value: deck.groupID, onChange: onGroupIDChange}),
                    " - ",
                    Input({type: "number", value: deck.number, onChange: onNumberChange})
                ]),
                Div(null, [
                    "召唤列表：",
                    Input({value: deck.supporter.join(" "), onChange: onSupporterChange})
                ])
            ])
        )
    }
}