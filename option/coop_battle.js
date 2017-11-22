
class CoopBattle extends React.Component {
    render () {
        const {script, onChange} = this.props
        if (!script) {
            return "please select a coop script!"
        }
        const change = (key, value) => {
            return () => {
                const rest = script
                rest[key] = value
                onChange(rest)
            }
        }
        const handleChange = (key) => {
            return (e) => {
                const rest = script
                rest[key] = e.target.value
                onChange(rest)
            }
        }
        return (
            Div(null, [
                Button({onClick: change("last", !script.last)}, script.last ? "尾刀〇" : "尾刀✕")
            ])
        )
    }
}