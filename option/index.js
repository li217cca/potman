

class Main extends React.Component {
    render () {
        const a = 123
        return (
            React.createElement("div", null, `罐子人 ${a}`)
        )
    }
}

ReactDOM.render(
    React.createElement(Main, null, null),
    document.getElementById('root')
)