import {cx, cy, fx, fy} from './constrains'

var pj = { };
let side = 0.5

pj.checkIfVisibleAxis = function(curCameraPosition, curAngleX, curAngleY, curAngleZ){
	var offset = 100
	var pointOuv = pj.getCameraPoint([0,0,0], curCameraPosition, curAngleX, curAngleY, -curAngleZ)
	if ( (pointOuv[0] > -offset) && (pointOuv[1] > -offset) && (pointOuv[0] < vidWidth+offset) && (pointOuv[1] < vidHeight+offset) ){
		return true
	}
	return false
}

pj.getCameraPositionWithSquarePoints = function(angleX, angleY, angleZ, cameraSquarePoints){

	norm = pj.getHorizontalPlaneNorm(-angleX, -angleY, angleZ)
	// console.log("norm1 ", norm1)
	// let norm =  [0, Math.cos(-angleX), Math.sin(-angleX)]  
	// console.log("norm ", norm)
	squarePointsXy1 = pj.pointsUvToXy1(cameraSquarePoints)
	// console.log(squarePointsXy1)
	var p1 = pj.getCrossPoint(squarePointsXy1[0], norm, D=1)
	var p2 = pj.getCrossPoint(squarePointsXy1[1], norm, D=1)
	var p3 = pj.getCrossPoint(squarePointsXy1[2], norm, D=1)
	var p4 = pj.getCrossPoint(squarePointsXy1[3], norm, D=1)
	
	let dist = (pj.distBetweenPoints(p1, p2) + pj.distBetweenPoints(p2, p3) + pj.distBetweenPoints(p3, p4) + pj.distBetweenPoints(p4, p1)) / 4

	let d = -side*2/dist

	p1 = pj.getCrossPoint(squarePointsXy1[0], norm, D=d)
	p2 = pj.getCrossPoint(squarePointsXy1[1], norm, D=d)
	p3 = pj.getCrossPoint(squarePointsXy1[2], norm, D=d)
	p4 = pj.getCrossPoint(squarePointsXy1[3], norm, D=d)

	var o3d = pj.getCenterOfPoints([p1, p2, p3, p4])

	var invCameraPos = pj.getCameraPositionFromXyzAndAngles(angleX, angleY, -angleZ, o3d, [0, 0, 0]).cameraPos

	return [-invCameraPos[0],  -invCameraPos[1], -invCameraPos[2]]
}

pj.getCameraPositionWithDistance = function(angleX, angleY, angleZ, cameraPoint, point3d, distance){
	var xy1 = [ (cameraPoint[0] - cx) / fx, (cameraPoint[1] - cy) / fy, 1]
	var t =  Math.sqrt( (distance * distance) / (xy1[0] * xy1[0] + xy1[1] * xy1[1] + 1) )
	var xyz = [ xy1[0] * t , xy1[1] * t , t ]
	return pj.getCameraPositionFromXyzAndAngles(angleX, angleY, angleZ, xyz, point3d)
}

pj.getCameraPositionWithZ = function(angleX, angleY, angleZ, cameraPoint, point3d, cameraZ){
	var xy1 = [ (cameraPoint[0] - cx) / fx, (cameraPoint[1] - cy) / fy, 1]
	curCameraPos = pj.getCameraPositionFromXyzAndAngles(angleX, angleY, angleZ, xy1, point3d).cameraPos
	var t =  (point3d[2] - cameraZ)  / (point3d[2] - curCameraPos[2]);
	var xyz = [ xy1[0] * t, xy1[1] * t, t ]
	return pj.getCameraPositionFromXyzAndAngles(angleX, angleY, angleZ, xyz, point3d)
}

pj.getCameraPositionFromXyzAndAngles = function(angleX, angleY, angleZ, xyz, point3d){
	var xyz1 = [ 0 , 0 , 5 ]

	point1 = pj.rotatePointY(xyz1, -angleY)
	point1 = pj.rotatePointX(point1, -angleX)
	point1 = pj.rotatePointZ(point1, -angleZ)
	point1[2] = -point1[2]

	point = pj.rotatePointY(xyz, -angleY)
	point = pj.rotatePointX(point, -angleX)
	point = pj.rotatePointZ(point, -angleZ)
	point[2] = -point[2]
	// console.log(point)
	cameraPos = [point3d[0] - point[0], point3d[1] - point[1], point3d[2] - point[2]]
	cameraLookAt = [cameraPos[0] + point1[0], cameraPos[1] + point1[1], cameraPos[2] + point1[2]]

	return {
		cameraPos : cameraPos,
		cameraLookAt : cameraLookAt
	}
}

pj.getAxesPoints = function(angleX, angleY, angleZ, cameraPos, axesLength){
	// var cameraPos = [10, -10, 10]
	var pointO = [0, 0, 0]
	var pointX = [axesLength, 0, 0]
	var pointY = [0, axesLength, 0]
	var pointZ = [0, 0, axesLength]

	var o = pj.getCameraPoint(pointO, cameraPos, angleX, angleY, -angleZ)
	var x = pj.getCameraPoint(pointX, cameraPos, angleX, angleY, -angleZ)
	var y = pj.getCameraPoint(pointY, cameraPos, angleX, angleY, -angleZ)
	var z = pj.getCameraPoint(pointZ, cameraPos, angleX, angleY, -angleZ)

	return {
		o: o,
		x: x,
		y: y,
		z: z
	}
}

pj.getCameraPointXyz = function(point, cameraPos, angleX, angleY, angleZ) {

	var npoint =  [point[0] - cameraPos[0], point[1] - cameraPos[1], -point[2] + cameraPos[2]]

	npoint = pj.rotatePointZ(npoint, angleZ)
	npoint = pj.rotatePointX(npoint, angleX)
	npoint = pj.rotatePointY(npoint, angleY)

	return npoint
}

pj.getCameraPoint = function(point, cameraPos, angleX, angleY, angleZ) {

	var npoint =  [point[0] - cameraPos[0], point[1] - cameraPos[1], -point[2] + cameraPos[2]]

	npoint = pj.rotatePointZ(npoint, angleZ)
	npoint = pj.rotatePointX(npoint, angleX)
	npoint = pj.rotatePointY(npoint, angleY)

	var u_v = pj.pointXyzToUv(npoint)
	return u_v
}

pj.getPointsDistance = function(point1, point2){
	return Math.sqrt( (point1[0] - point2[0]) * (point1[0] - point2[0]) + (point1[1] - point2[1]) * (point1[1] - point2[1]) + (point1[2] - point2[2]) * (point1[2] - point2[2]))
}

pj.pointXyzToUv = function(point) {
	var xy1 = [point[0] / point[2], point[1] / point[2], 1]
	// console.log(xy1)
	var u = fx * xy1[0] + cx
	var v = fy * xy1[1] + cy

	return [u, v]
}




pj.getStartPointsWithCameraPosition = function(cameraPos, angleX, angleY, angleZ){
	// console.log(cameraPos, angleX, angleY, angleZ)
	let point1wc = [-side, side,  0]
	let point2wc = [ side, side,  0]
	let point3wc = [ side, -side, 0]
	let point4wc = [-side, -side, 0]

	var point1uv = pj.getCameraPoint(point1wc, cameraPos, angleX, angleY, -angleZ)
	var point2uv = pj.getCameraPoint(point2wc, cameraPos, angleX, angleY, -angleZ)
	var point3uv = pj.getCameraPoint(point3wc, cameraPos, angleX, angleY, -angleZ)
	var point4uv = pj.getCameraPoint(point4wc, cameraPos, angleX, angleY, -angleZ)

	return [point1uv, point2uv, point3uv, point4uv]
}


pj.getHorizontalPlaneNorm = function(angleX, angleY, angleZ){
	var pointO = [0, 0, 0]
	var pointZ = [0, 0, -1]

	pointZ = pj.rotatePointZ(pointZ, -angleZ)
	pointZ = pj.rotatePointX(pointZ, -angleX)
	pointZ = pj.rotatePointY(pointZ, -angleY)

	return pointZ
}







pj.normVec = function(vec){

	let normedVec = []
	var dist2 = 0
	for (var i = 0; i < vec.length; i++) {
		dist2 = dist2 + vec[i] * vec[i]
	}
	dist2 = Math.sqrt(dist2)
	for (var i = 0; i < vec.length; i++) {
		normedVec.push(vec[i]/dist2)
	}
	return normedVec
}

pj.getCrossPoint = function(pointLine, planeNorm, D){

	let t = - D / (planeNorm[0] * pointLine[0] + planeNorm[1] * pointLine[1] + planeNorm[2] * pointLine[2])
	return [pointLine[0] * t, pointLine[1] * t, pointLine[2] * t]
}



pj.pointsUvToXy1 = function(pointsUv){

	let pointsXy1 = []
	for (var i = 0; i < pointsUv.length; i++) {
		let curPointXy1 = pj.pointUvToXy1(pointsUv[i])
		pointsXy1.push(curPointXy1)
	}
	return pointsXy1
}

pj.pointUvToXy1 = function(point) {

	return [ (point[0] - cx) / fx, (point[1] - cy) / fy, 1]
}

pj.rotatePointX = function(point, angleX){

	if (point.length > 3) {
		point = [point[0], point[1], point[2]]
	}

	let cosX = Math.cos(angleX)
	let sinX = Math.sin(angleX)	

	let Rx = [[1,    0,   0   ],
			  [0,  cosX, -sinX],
			  [0,  sinX,  cosX]]

	return new_point_xyz = numeric.dot(Rx, point)
}

pj.rotatePointY = function(point, angleY){

	if (point.length > 3) {
		point = [point[0], point[1], point[2]]
	}

	let cosY = Math.cos(angleY)
	let sinY = Math.sin(angleY)	

	let Ry = [[cosY, 0, sinY],
			 [0,    1,   0 ],
			 [-sinY, 0, cosY]]

	return new_point_xyz = numeric.dot(Ry, point)
}

pj.rotatePointZ = function(point, angleZ){
if (point.length > 3) {
		point = [point[0], point[1], point[2]]
	}
    let cosZ = Math.cos(angleZ)
    let sinZ = Math.sin(angleZ)
    
    let Rz = [[cosZ,   -sinZ,  0],
			[sinZ,    cosZ,  0],
          	[0,       0,     1]]
    
    
    return numeric.dot(Rz, point)
}

pj.distBetweenPoints = function(point1, point2){

	var dist2 = 0
	for (var i = 0; i < point1.length; i++) {
		dist2 = dist2 + (point1[i] - point2[i]) * (point1[i] - point2[i])
	}

	return Math.sqrt(dist2)
}

pj.getCenterOfPoints = function(points){

	let pointsLen = points.length
	let centerPoint = []
	for (var i = 0; i < points[0].length; i++) {
		centerPoint.push(0)
		for (var j = 0; j < points.length; j++) {
			centerPoint[i] = centerPoint[i] + points[j][i] / pointsLen
		}
	}
	return centerPoint
}

