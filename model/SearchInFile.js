// function searchText(key, text){
//     var result=''
//     //delim = \n
//     text.split("\n").forEach(row=>{
//         if(row.search(key) != -1)
//             result += row+'\n'
//     }) 
//     return result
// }

function searchAnomaly(key, text){
    var result=''
    //delim = \n
    text.split("\n").forEach(token=>{
        if(token > key)
            result += token+'\n'
    }) 
    return result
}

function parseCSVFile(text){
    const lines = text.split('\r\n') //TODO check if \r\n is needed. or \r\n?|\n
    let features = lines[0].split(',')
    var num_of_rows = lines.length - 1
    var num_of_col = features.length
    lines.shift() //removes first line of feature names

    var dict = {}
    

    for(let i = 0; i < num_of_col; i++){
        dict[features[i]] = new Array()
    }
    //console.log(dict)

    for(let i = 0; i < num_of_rows; i++){
        let tokens = lines[i].split(',')
        for(let j = 0; j < num_of_col; j++){
            dict[features[j]].push(tokens[j])
        }
        tokens = ''
    }

    //console.log(dict)

    let data = ''
    var feature_str = ''
    var values_str = ''
    for(let i = 0; i < num_of_col; i++){
        feature_str = features[i].toString()
        values_str = dict[features[i]].toString()

        data += feature_str
        data += ': '
        data += values_str
        data += '\n'

        var feature_str = ''
        var values_str = ''
    }
    return [data, features ,features.length.toString(), dict]
}


module.exports.parseCSVFile = parseCSVFile
module.exports.searchAnomaly = searchAnomaly