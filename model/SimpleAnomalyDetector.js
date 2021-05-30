const util = require('../model/anomaly_detection_util')
const Point = require('../model/Point')
const reg_line_m = require('../model/Line')
//const enclosingCircle = require('./node_modules/smallest-enclosing-circle/dist/smallestEnclosingCircle')
const enclosingCircle = require('smallest-enclosing-circle')

function toPoints( x,  y){
    var ps = []
    for (var i = 0; i < x.length; i++) {
        var p = { x: x[i], y: y[i] };
        ps[i] = p;
    }
    return ps;
}
function findThreshold( ps, len,rl){
	var max=0;
	for(var i=0;i<len;i++){
		var d=abs(ps[i].y - rl.f(ps[i].x));
		if(d>max)
			max=d;
	}
	return max;
}
function learnHelper( ts, p/*pearson*/, f1,  f2, ps){
    //console.log(p) //all 0
    // console.log(f1) // 0-2000
    // console.log(f2) // all 0
    // console.log("NOW ITS PS")
    // console.log(ps) //[ { x: '4', y: 'A' } ]
	if(p>0.9){
		var len=ts[Object.keys(ts)[0]].length - 1;
		var line = util.linear_reg(ps, len);
		var t = findThreshold(ps, len, line) * 1.1; // 10% increase
        var c = { feature1: f1, feature2: f2, correlation: p, lin_reg: line, threshold: t };
        correlatedFeatures.push(c);
    }
}

function learnNormal(key, train_file, features_names,number_of_features) {

    console.log(train_file[Object.keys(train_file)[15]][0])

    var cf = [];
    var tmp1, tmp2;
    var f1 //string
    var f2 //string
    var maxCorrelatedFeature;
    var pearsonCorrelation; //float
    var maxPearsonCorrelation; //float
    var maxDeviation; //float
    var sizeOfDataTable = number_of_features//= ts.columnFeature.size(); //int
    var sizeOfVector = 0;
    var maxCorrelatedFeatureIndex = 0;
    var m_threshold = 0.9;
    f1 = features_names[0]
    tmp1 = train_file[f1]
    for (let i = 0; i < sizeOfDataTable; i++) {
        f1 = features_names[i]
        tmp1 = train_file[f1]
        sizeOfVector = tmp1.length - 1 //100
        pearsonCorrelation = 0;
        maxPearsonCorrelation = 0;
        let ps = []
        for(let j = i + 1; j < sizeOfDataTable; j++) {
            f2 = features_names[j]
            tmp2 = train_file[f2]
            for(let k = 0; k < sizeOfVector; k++){
                ps[k] = {x: tmp1[k], y: tmp2[k]}; //correct values
            }
        pearsonCorrelation = util.pearson(tmp1, tmp2, sizeOfVector);//correctish values
        pearsonCorrelation = Math.abs(pearsonCorrelation); 
        if(maxPearsonCorrelation < pearsonCorrelation) {
            maxPearsonCorrelation = pearsonCorrelation;
            maxCorrelatedFeatureIndex = j;
            linearRegression = util.linear_reg(ps, sizeOfVector);
            maxDeviation = util.maxDev(tmp1, tmp2, sizeOfVector, linearRegression);
        }        
        maxCorrelatedFeature = train_file[features_names[maxCorrelatedFeatureIndex]];
        }
        if(m_threshold < maxPearsonCorrelation) {
            var tmpCF = {feature1: f1, feature2: features_names[maxCorrelatedFeatureIndex], corrlation: maxPearsonCorrelation, threshold: maxDeviation * (1.1), lin_reg: linearRegression};
            cf.push(tmpCF);
        }

        if(key == 2) {
            //console.log("if key is 2")
            if(0.5 < maxPearsonCorrelation && maxPearsonCorrelation < m_threshold) {
                //console.log("if corr is bigger than 0.5 but smaller then 0.9")
                var tmpCF2 = {feature1: f1, feature2: maxCorrelatedFeature, corrlation: maxPearsonCorrelation, threshold: maxDeviation * (1.1), lin_reg: linearRegression};
                let ps2 = []
                for(let g = 0; g < sizeOfVector; g++){
                    ps2[g]={x: parseFloat(tmp1[g]), y: parseFloat(tmp2[g])}; // TODO delete ps
                }
                let circle = enclosingCircle(ps2, ps2.length);
                console.log(circle)
                console.log("helloCircle")
                //console.log(c.radius, c.center)
                tmpCF2.cf_radius = circle.radius; // minimum radius to cover all training points.
                tmpCF2.cf_center = circle.center;
                tmpCF2.threshold = circle.radius * (1.1);
                //tmpCF2.threshold = c.radius * 1.2;
                //tmpCF2.threshold = c.radius * 1.05;
                //tmpCF2.threshold = maxDeviation * (1 + minimumThreshold);
                cf.push(tmpCF2);
            }
        }
    }

    return cf;
}


function detect(key, anomaly_file, cf) {
    let anomaly_report = [];
    var size = cf.length;
    var names = anomaly_file[1];
    var numOfNames = anomaly_file[2];
    var dictionary = anomaly_file[3];
    var arr1 = []
    var arr2 = []
    for (let i = 0; i < size; i++) {

        var f1 = cf[i].feature1; //A
        var f2 = cf[i].feature2; //C
        var t1 = dictionary[f1]
        var t2 = dictionary[f2]
        var len = dictionary[f1].length - 1;
        
        for (let j = 0; j < len; j++) {


            // t1.forEach(elem => arr1.push(elem));
            //console.log(t1)
            //console.log('----------------------------')
            // t2.forEach(elem2 => arr2.push(elem2));

            // for( var i in t1){
            //     console.log(i)
            // }
            //console.log(arr1[j], arr2[j])
            
            p1 = {x: dictionary[Object.values(dictionary)[f1]][j], 
                y: dictionary[Object.values(dictionary)[f2]][j]};
            //console.log(t1)
            var temp1 = util.deviation(p1, cf[i].lin_reg);
            var temp2 = cf[i].threshold;

            if (temp1 > temp2) {

                // console.log("dev is: " + temp1,
                //             "threshold is: " + temp2, 
                //             "the corr features: " + cf[i].feature1 + ", " + cf[i].feature2);
                var s = cf[i].feature1 + '-' + cf[i].feature2;
                var rep = { reason: 'Linear Regression', 
                            timeStep: j + 1, 
                            feature1: cf[i].feature1, 
                            feature2: cf[i].feature2, 
                            description:'y = '+cf[i].lin_reg.a.toFixed(2)+'x + '+cf[i].lin_reg.b.toFixed(2) };
                anomaly_report.push(rep);
            }
        }
    }
    console.log("the anomalies are: " + anomaly_report[0].reason, 
    anomaly_report[0].timeStep, 
    anomaly_report)
    return anomaly_report;
}
function isAnomalous(x, y, c) {
    var f = (c.lin_reg.a * x) + c.lin_reg.b
    return Boolean(Math.abs(y - f) > c.threshold);
}

module.exports.learnNormal = learnNormal
module.exports.detect = detect
module.exports.isAnomalous = isAnomalous
module.exports.findThreshold = findThreshold
