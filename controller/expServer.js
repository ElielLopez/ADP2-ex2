const express = require('express')
const fileUpload = require('express-fileupload')
const model = require('../model/SearchInFile') //model.searchText
const learnModel = require('../model/SimpleAnomalyDetector')
//const enclosingCircle = require('smallest-enclosing-circle')

const app = express()
app.use(express.urlencoded({
    extended: false
}))

app.use(fileUpload())
app.use(express.static('../view'))
//asynch
app.get("/",(req,res)=>{ // read index.html
    res.sendFile("./index.html")
})

app.post("/search", (req,res)=>{
    res.write('searching for ' + req.body.key + ':\n')
    var key = req.body.key
    if(req.files){
        var file = req.files.text_file
        var result = model.searchAnomaly(key, file.data.toString())
        //var result = model.parseCSVFile(file.data.toString())
        res.write(result.toString())
    }
    res.end()
})

var result2;
var dict;

app.post("/trainCSVfile", (req,res)=>{

    var key = req.body.AlgList //"RegAlg = 1 "HybAlg = 2

    if(key == 1) {
        res.write("The choosen algorithm is: Regrssion algorithm \n")
    }

    if(key == 2) {
        res.write("The choosen algorithm is: Hybrid algorithm \n")
    }

    res.write('Training... \n' + "Please wait...\n")
    if(req.files){
        var file2 = req.files.train_file
        let result = model.parseCSVFile(file2.data.toString())
        let features_names = result[1]
        let num_of_features = result[2]
        dict = result[3]
        //res.write(result[0] + num_of_features + '\n')
        res.write("Features names: " + features_names.toString())
        result2 = learnModel.learnNormal(key, dict, features_names,num_of_features)//result[0]
        // let result3 = learnModel.learnNormal(dict, features_names,num_of_features)//result[0]
        // console.log(result3)
        // res.write(result2)
    }
    
    res.end()
})

app.post("/detectAnomalies", (req,res)=>{
    res.write('Detecting anomalies please wait... \n')

    var key = req.body.AlgList
    //"RegAlg = 1
    //"HybAlg = 2

    if(req.files){
        var file1 = req.files.anomalies_file
        var parser = model.parseCSVFile(file1.data.toString())
        let features_names = parser[1]
        // //console.log(features_names)
        let num_of_features = parser[2]
        // //console.log(num_of_features)
        let dict = parser[3]
        // //console.log(dict)
        //console.log(result2)
        result3 = learnModel.detect(key, parser, result2)//result[0]
        for( let i = 0; i < result3.length; i++){
            var data = "Feature 1: " + result3[i].feature1 + "\n" + "Feature 2: " + result3[i].feature2 + "\n"
            data += "Time step: " + result3[i].timeStep + "\n"
            data += "Description:  " + result3[i].description + "\n" + "Reason: " + result3[i].reason + "\n"
            res.write("the anomalies are: " + "\n" + "Anomaly number " + (i + 1) + ": " + "\n" + data + "\n")
        }
        //res.write(result3[0].feature1 + result3[0].feature2)
    }
    res.end()
})


// Start Server
app.listen(8080, ()=>console.log("Server Connected"))