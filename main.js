/**
 * Created by cifer on 2017/9/17.
 */
require('fs').readFile("c:\\workspace\\gbf\\source.js", "utf8", (err, data) => {
    if (err) throw err;
    eval(data.substring(0, data.indexOf("!")-1))
    // console.log(_$)
    var result
    for (var d=data, i = d.indexOf("_$["); i !== -1; i = d.indexOf("_$[")) {
        var num = parseInt(d.substring(i+3, d.indexOf("]", i)))
        d = d.replace(/_\$\[\d*\]/, '"'+_$[num]+'"')
        result = d
    }
    result = result.substring(result.indexOf("!")+1)
    console.log(result)
})