const line = require('../model/Line')


// return the average of x
function avg( x, size){
//console.log(x[0])
var sum = 0;
for(var i=0;i<size;i++){
	var t = parseInt(x[i], 10);
    sum+=t;
}
var z = sum/size
//console.log("avg : " + z )
return z;
}
// returns the variance of X and Y
function variance(x,size){
var av=avg(x,size);
var sum=0;
for(var i=0;i<size;i++){
    sum+=x[i]*x[i];
}
var t = sum/size
var z = av*av
var total = t - z
//console.log("variance : " + total)
return total;
}
// returns the covariance of X and Y
function cov( x,  y, size){
	var sum=0;
	for(var i=0;i<size;i++){
		sum+=x[i]*y[i];
	}
	sum/=size;
	// var avg1 = avg(x,size);
	// var avg2 = avg(y,size);
	// var avgMult = avg1 * avg2;
	// var total = sum - avgMult;
	//console.log("cov : " + (sum - avg(x,size)*avg(y,size)))
	return sum - avg(x,size)*avg(y,size);
}
// returns the Pearson correlation coefficient of X and Y
function pearson( x,  y,  size){
	var covi = cov(x, y, size);
	var squar1 = Math.sqrt(variance(x,size));
	var squar2 = Math.sqrt(variance(y,size));
	var squar2squar = squar1 * squar2;
	var total = covi/squar2squar;
	//console.log(total);
	return cov(x,y,size)/(Math.sqrt(variance(x,size))*Math.sqrt(variance(y,size)));
}
// performs a linear regression and returns the line equation
function linear_reg( points, size){
    var x = [0];
    var y = [0];
	for(var i=0;i<size;i++){
		x[i]=points[i].x;
		y[i]=points[i].y;
	}
	var a=cov(x,y,size)/variance(x,size);
	var b=avg(y,size) - a*(avg(x,size));
	//console.log(a,b)
	var line={ a: a, b: b };

	return line;
}
// returns the deviation between point p and the line equation of the points
function dev( p, points, size){
	var l=linear_reg(points,size);
	return deviation(p,l);
}

function deviation(p, l){
	var deviation = 0
	var px = p.x
	var py = p.y
	var lineY = 0
	var a = l.a
	var b = l.b
	lineY = (a * px) + b
	var total = Math.abs(lineY-py)
	//console.log(p.x[0],p.y[0],"total is: " + total)
	return total;	
}
// returns the deviation between point p and the line
// function deviation( p, l){
// 	return abs(p.y-l.calcFunc(p.x));
// }

function maxDev(v1, v2, size,linearRegression) {
    var max = 0;
    var l = linearRegression;
    for (let i = 0; i < size; i++) {
        var p ={x: v1[i], y: v2[i]};
        var temp = deviation(p, l);
		//console.log(temp)
        delete p;
        if (temp > max) {
            max = temp;
        }
    }
    return max;
}



module.exports.avg = avg
module.exports.variance = variance
module.exports.cov = cov
module.exports.pearson = pearson
module.exports.linear_reg = linear_reg
module.exports.dev = dev
module.exports.deviation = deviation
module.exports.maxDev = maxDev