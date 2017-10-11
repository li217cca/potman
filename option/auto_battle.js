
class AutoBattle extends React.Component {
    render () {
        const {script, onChange} = this.props
        if (!script) {
            return "please select a script!"
        }
        const onNameChange = e => {
            onChange({...script, name: e.target.value})
        }
        const onUrlChange = e => {
            onChange({...script, url: e.target.value})
        }
        const onAPChange = e => {
            onChange({...script, ap: parseInt(e.target.value)})
        }
        const onDeckChange = deck => {
            onChange({...script, deck: deck})
        }
        const onBattleChange = battle => {
            onChange({...script, battle: battle})
        }
        const onBossPosChange = pos => {
            onChange({...script, boss_pos: pos})
        }
        return (
            Div(null, [
                Div(null, ["名称：", Input({onChange: onNameChange, value: script.name})]),
                Div(null, ["URL: ", Input({onChange: onUrlChange, value: script.url})]),
                Div(null, ["AP: ", Input({onChange: onAPChange, value: script.ap, type: "number"})]),
                Div(null, ["AP: ", Input({onChange: onBossPosChange, value: script.boss_pos, type: "number"})]),
                E(DeckScript, {deck: script.deck, onChange: onDeckChange}),
                E(BattleScript, {battle: script.battle, onChange: onBattleChange})
            ])
        )
    }
}