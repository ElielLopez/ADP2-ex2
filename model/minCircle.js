const util = require('../model/Point')
function  dist( a, b){
    var x2 = (a.x - b.x) * (a.x - b.x);
    var y2 = (a.y - b.y) * (a.y - b.y);
    var w=x2 + y2;
    return Math.sqrt(w);
}
function from2points( a, b){
	var x=(a.x+b.x)/2;
	var y=(a.y+b.y)/2;
	var r=dist(a,b)/2;
    var circle={center:{x:x,y:y},R:r};
	return circle;
}
function from3Points(a,  b,  c){
	// find the circumcenter of the triangle a,b,c
	var mAB = {x : ((a.x+b.x)/2) , y : ((a.y+b.y)/2)}; // mid point of line AB
	var slopAB = (b.y - a.y) / (b.x - a.x); // the slop of AB
	var pSlopAB = - 1/slopAB; // the perpendicular slop of AB
	// pSlop equation is:
	// y - mAB.y = pSlopAB * (x - mAB.x) ==> y = pSlopAB * (x - mAB.x) + mAB.y
	
	var mBC={x:((b.x+c.x)/2) , y:((b.y+c.y)/2)}; // mid point of line BC
	var slopBC = (c.y - b.y) / (c.x - b.x); // the slop of BC
	var pSlopBC = - 1/slopBC; // the perpendicular slop of BC
	// pSlop equation is:
	// y - mBC.y = pSlopBC * (x - mBC.x) ==> y = pSlopBC * (x - mBC.x) + mBC.y
	
	/*
	pSlopAB * (x - mAB.x) + mAB.y = pSlopBC * (x - mBC.x) + mBC.y
	pSlopAB*x - pSlopAB*mAB.x + mAB.y = pSlopBC*x - pSlopBC*mBC.x + mBC.y
	
	x*(pSlopAB - pSlopBC) = - pSlopBC*mBC.x + mBC.y + pSlopAB*mAB.x - mAB.y
	x = (- pSlopBC*mBC.x + mBC.y + pSlopAB*mAB.x - mAB.y) / (pSlopAB - pSlopBC);
	
	*/
	
	var x = (- pSlopBC*mBC.x + mBC.y + pSlopAB*mAB.x - mAB.y) / (pSlopAB - pSlopBC);
	var y = pSlopAB * (x - mAB.x) + mAB.y;
    var t = (c.x - b.x);
	var cent={x:x,y:y};
	var a=dist(cent,a);
	var circle={center:{x:x,y:y},R:a};
	return circle;

}
function trivial( P){
	if(P.length==0){
        var t = {center:{x:0,y:0},R:0};
		return t;
    }
	else if(P.length==1){
        var t = { center:{x:P[0].x, y:P[0].y}, R:0 }
		return t;
    }
	else if (P.length==2)
		return from2points(P[0],P[1]);

	// maybe 2 of the points define a small circle that contains the 3ed point
	var c=from2points(P[0],P[1]);
	if(dist(P[2],c.center)<=c.radius)
		return c;
	c=from2points(P[0],P[2]);
	if(dist(P[1],c.center)<=c.radius)
		return c;
	c=from2points(P[1],P[2]);
	if(dist(P[0],c.center)<=c.radius)
		return c;
	// else find the unique circle from 3 points
	return from3Points(P[0],P[1],P[2]);
}
function welzl( P, R,  n){
	if(n==0 || R.length==3){
		return trivial(R);
	}

	// remove random point p
	// swap is more efficient than remove
	//srand (time(NULL));
	var i = Math.floor(Math.random()*(n-1));
    console.log(i);
	var p={x:P[i].x,y:P[i].y};
    var temp = {x:P[i].x,y:P[i].y};
    P[i] = {x:P[n - 1].x,y:P[ n - 1 ].y};
    P[n - 1] = {x:temp.x,y:temp.y};

	var c=welzl(P,R,n-1);

	if(dist(p,c.center)<=c.radius)
		return c;

	R.push(p);

	return welzl(P,R,n-1);
}

var a = { x: 2, y: 2 };
var b = { x: 4, y: 4 };
var c = { x: 6, y: 5 };
let pArr = [a,b,c];
let rArr = [];
console.log(pArr[0],pArr[1],pArr[2]);
console.log(welzl(pArr,rArr,pArr.length));

module.exports = welzl