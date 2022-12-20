var vs = { };

vs.jsPointsToCv32 = function (jsMatrix){
	let output = []
	let rows = jsMatrix.length
	let cols = jsMatrix[0].length
	for( var i = 0; i < rows; i++ ){
		for( var j = 0; j < cols; j++ ){
			let curVal = jsMatrix[i][j]
			output.push(curVal)
		}
		
	} 
	return cv.matFromArray(rows, 1, cv.CV_32FC2, output)
}

vs.cvPointsToJs = function (cvPoints){
	let output = []
	for( var i = 0; i < cvPoints.rows; i++ ){
		let row = []
		for( var j = 0; j < 2; j++ ){
			let curVal = cvPoints.data32F[cvPoints.cols * i * 2 + j]
			row.push(curVal)
		}
		output.push(row)
	} 
	return output
}

vs.cvKpsToJs = function (kps){
	var kpsOutput = []
	for (var i = 0; i < kps.size(); i++) { 
		kpsOutput.push( kps.get(i) )
	}
	return kpsOutput
}

vs.arrayMean = function (array){
	sum = 0
	for( var i = 0; i < array.length; i++ ){
		sum += array[i];
	}
	return sum / array.length
}

vs.getBoundsJs = function (followPointsJs, bWidth, bHeight, fWidth, fHeight, scale){

	let pointsX = []
	let pointsY = []
	for (var i = 0; i < followPointsJs.length; i++) {
		pointsX.push(followPointsJs[i][0]*scale)
		pointsY.push(followPointsJs[i][1]*scale)
	}

	var centerX = vs.arrayMean(pointsX)
	var centerY = vs.arrayMean(pointsY)

	if (centerX < bWidth / 2)          { centerX = bWidth / 2 }
	if (centerX + bWidth / 2 > fWidth) { centerX = fWidth - bWidth / 2}

	if (centerY < bHeight / 2)           { centerY = bHeight / 2 }
	if (centerY + bHeight / 2 > fHeight) { centerY = fHeight - bHeight / 2}

	return {
			minX : Math.round( centerX - bWidth / 2 ),
			maxX : Math.round( centerX + bWidth / 2 ),
			minY : Math.round( centerY - bHeight / 2 ),
			maxY : Math.round( centerY + bHeight / 2 ),
			width : Math.round( bWidth ),
			height : Math.round( bHeight )
			}
}

vs.getHomographyWithOffsetsFrom4pointsMatches = function (pointsFrom, pointsTo, dist, offsetX1, offsetY1, offsetX2, offsetY2){
	var pointsFromArray = []
	var pointsToArray = []
	for (var i = 0 ; i < pointsFrom.length; i++){
		if (i%2) {
			pointsFromArray.push(pointsFrom[i] + offsetY1) 
		} else {
			pointsFromArray.push(pointsFrom[i] + offsetX1)
		}
	}
	for (var i = 0 ; i < pointsTo.length; i++){
		if (i%2) {
			pointsToArray.push(pointsTo[i] + offsetY2)
		} else {
			pointsToArray.push(pointsTo[i] + offsetX2)
		}
	}

	var pointsFrom = new cv.matFromArray(pointsFromArray.length/2, 2, cv.CV_32FC1, pointsFromArray)
	var pointsTo   = new cv.matFromArray(pointsToArray.length/2, 2, cv.CV_32FC1, pointsToArray)
	var H = new cv.Mat();
	var mask = new cv.Mat();
	
	H = cv.findHomography(pointsFrom, pointsTo, cv.RANSAC, dist, mask)
	score = 0
	for (var i = 0; i < mask.rows; i++){
		if (mask.data[i] > 0){
			score = score + 1
		}
	}
	var allMatchesCount =  mask.data.length
	pointsFrom.delete(); pointsTo.delete(); mask.delete(); 
	// console.log("homo score", score / mask.data.length)
	return { "homo" : H, "score" : score, "count" : allMatchesCount }
}

vs.getHomographyWithOffsets = function (matches, kp1, kp2, dist, offsetX1, offsetY1, offsetX2, offsetY2){
	// console.log("1")

	if (Array.isArray(matches) == false){
		matches = vs.cvMatchesToJs(matches) 
	}
	if (Array.isArray(kp1) == false){
		kp1 = vs.cvKpsToJs(kp1) 
	}
	if (Array.isArray(kp2) == false){
		kp2 = vs.cvKpsToJs(kp2) 
	}
	// console.log(kp1.length)
	// console.log(kp2.length)
	// console.log("matches.length ", matches)

	var pointsFromArray = []
	var pointsToArray = []
	for (var i = 0; i < matches.length; i++) {

		// let curMatch = matches.get(i)
		// console.log(i, matches[i])
		if ( (kp1[matches[i][0]] === undefined) || (kp2[matches[i][1]] === undefined ) ){
			console.log(i, matches[i])
		} else {
			let curPointFrom = kp1[matches[i][0]].pt
			// TODO smts [5, undefined, 0]
			let curPointTo   = kp2[matches[i][1]].pt

			pointsFromArray.push( ( curPointFrom.x + offsetX1) )
			pointsFromArray.push( ( curPointFrom.y + offsetY1) )

			pointsToArray.push( (curPointTo.x + offsetX2) )
			pointsToArray.push( (curPointTo.y + offsetY2) )
		}
	}

	if ( (pointsFromArray.length/2 < 8) || (pointsToArray.length/2 < 8) ){
		return new cv.Mat()
	}

	var pointsFrom = new cv.matFromArray(pointsFromArray.length/2, 2, cv.CV_32FC1, pointsFromArray)
	var pointsTo   = new cv.matFromArray(pointsToArray.length/2, 2, cv.CV_32FC1, pointsToArray)
	var H = new cv.Mat();
	var mask = new cv.Mat();
	
	H = cv.findHomography(pointsFrom, pointsTo, cv.RANSAC, dist, mask)
	score = 0
	for (var i = 0; i < mask.rows; i++){
		if (mask.data[i] > 0){
			score = score + 1
		}
	}
	var allMatchesCount =  mask.data.length
	pointsFrom.delete(); pointsTo.delete(); mask.delete(); 
	return { "homo" : H, "score" : score, "count" : allMatchesCount}
}

vs.getHomosCombination = function (h12, h23){ //data64F
	var h12js = [ [h12.data64F[0], h12.data64F[1], h12.data64F[2]], [h12.data64F[3],h12.data64F[4],h12.data64F[5]], [h12.data64F[6],h12.data64F[7],h12.data64F[8]] ]
	var h23js = [ [h23.data64F[0], h23.data64F[1], h23.data64F[2]], [h23.data64F[3],h23.data64F[4],h23.data64F[5]], [h23.data64F[6],h23.data64F[7],h23.data64F[8]] ]
	let h13js = numeric.dot(h23js, h12js)

	output = [ h13js[0][0], h13js[0][1], h13js[0][2], h13js[1][0], h13js[1][1], h13js[1][2], h13js[2][0], h13js[2][1], h13js[2][2]]

	return  cv.matFromArray(3, 3, cv.CV_64FC1, output)
}

vs.get4pointMulilevelMatches = function (kp1, kp2, pdi1, pdi2, numLevels){
	matchesToFilter = []
	matches = []
	for (var i = 0; i < numLevels; i++){
		matchesVec = new cv.DMatchVector();
		// console.log(pdi1.decs[i].rows, pdi2.decs[i].rows)
		if ( (pdi1.decs[i].rows == 0) || (pdi2.decs[i].rows == 0) ) {continue}
		matcher.match(pdi1.decs[i], pdi2.decs[i], matchesVec);
		// matchesByLevels.push(matchesVec)
		for (var j = 0; j < matchesVec.size(); j++){

			if (matchesVec.get(j).distance < 80) {
				var indFrom = pdi1.inds[i][ matchesVec.get(j).queryIdx ]
				var indTo   = pdi2.inds[i][ matchesVec.get(j).trainIdx ]

				var pointFrom = kp1.get(indFrom).pt
				var pointTo = kp2.get(indTo).pt

				matchesToFilter.push(pointFrom.x)
				matchesToFilter.push(pointFrom.y)
				matchesToFilter.push(pointTo.x)
				matchesToFilter.push(pointTo.y)

				matches.push( [indFrom, indTo] )
			}
		}
		matchesVec.delete()
	}
	return { "matchesToFilter" : matchesToFilter,
			 "matches" 			 : matches}
}


vs.pointPerspectiveTransform = function (pointsCv, H){
	var desPointsCv = new cv.Mat();
	cv.perspectiveTransform(pointsCv, desPointsCv, H)
	return desPointsCv
}


vs.createSceneDescriptorsCvobject = function(descriptors){
	var curDescriptorsArray = []
	for (var i = 0; i < descriptors.length; i++){
		for (var j = 0; j < 32; j++){
			curDescriptorsArray.push(descriptors[i][j])
		}
	}
	return cv.matFromArray(descriptors.length, 32, cv.CV_8U, curDescriptorsArray) 
}

vs.getPointsAndDescriptorsByLevels = function (kps, decs, levelCount) {

	if (Array.isArray(kps) == false){
		kps = vs.cvKpsToJs(kps) 
	}

	var levelsKeypoints = []
	var levelsDescriptors = []
	var levelsDescriptorsCv = []
	var levelsInds = []
	for (var i = 0; i < levelCount; i++) {
		levelsKeypoints.push([])
		levelsDescriptors.push([])
		levelsInds.push([])
	}
	for (var i = 0; i < kps.length; i++) {
		var curKp = kps[i]
		var curDesc = vs.getDescriptorFromDesriptorsArray(decs, i)
		var curLevel = curKp.octave

		levelsKeypoints[curLevel].push(curKp)
		levelsDescriptors[curLevel].push(curDesc)
		levelsInds[curLevel].push(i)
	}

	
	// console.log(descriptors1)
	for (var i = 0; i < levelCount; i++) {

		levelsDescriptorsCv.push(vs.createSceneDescriptorsCvobject(levelsDescriptors[i]))
	}

	return {
		kps : levelsKeypoints,
		decs: levelsDescriptorsCv,
		inds: levelsInds
	}
}


vs.getDescriptorFromDesriptorsArray = function (desriptors, ind){
	var outputDesriptorArray = []
	var desriptorLength = desriptors.cols
	for (var i = 0; i < desriptorLength; i++) {
		var curVal = desriptors.data[ind * desriptorLength + i]
		outputDesriptorArray.push(curVal)
	}
	return outputDesriptorArray
}

vs.getCameraSettings = function (stream) {
	var settings = stream.getVideoTracks()[0].getSettings()
	console.log(settings.deviceId)
	console.log(settings.frameRate)
	console.log("h", settings.height)
	console.log("w", settings.width)

	// debag.innerText = settings.frameRate + " h " + settings.height + " w " + settings.width + " f " + height + " " + width + " b " + boundsHeight.toFixed(0) + " " + boundsWidth.toFixed(0)
}

vs.getExactlyHomography = function (pointsFrom, pointsTo){
	var pointsFromArray = []
	var pointsToArray = []
	for (var i = 0; i < pointsFrom.length; i++){
		pointsFromArray.push(pointsFrom[i][0])
		pointsFromArray.push(pointsFrom[i][1])
	}
	for (var i = 0; i < pointsTo.length; i++){
		pointsToArray.push(pointsTo[i][0])
		pointsToArray.push(pointsTo[i][1])
	}
	var pointsFrom = new cv.matFromArray(pointsFromArray.length/2, 2, cv.CV_32FC1, pointsFromArray)
	var pointsTo   = new cv.matFromArray(pointsToArray.length/2, 2, cv.CV_32FC1, pointsToArray)
	var H = new cv.Mat();
	
	H = cv.findHomography(pointsFrom, pointsTo)
	
	pointsFrom.delete(); pointsTo.delete();

	return H
}

vs.getScoreWithWasm = function (pdi1, pdi2, homo, error2){
	var score = 0
	var numLevels = pdi1.kps.length

	for (var i = 0; i < numLevels; i++){
		var levelScore = 0
		var kps1 = pdi1.kps[i]
		var kps2 = pdi2.kps[i]

		var points1From = []

		for ( var j = 0; j < kps1.length; j++){
			var curKp = kps1[j]
			points1From.push(curKp.pt.x)
			points1From.push(curKp.pt.y)
		}

		var pointsCv = new cv.matFromArray(points1From.length/2, 1, cv.CV_32FC2, points1From)
		var desPointsCv = new cv.Mat();

		cv.perspectiveTransform(pointsCv, desPointsCv, homo)

		points1 = []

		for (var k = 0; k < points1From.length; k++){
			points1.push(Math.round(desPointsCv.data32F[k]))
		}

		points2 = []

		for (var k = 0; k < kps2.length; k++){ 
			points2.push(Math.round(kps2[k].pt.x))
			points2.push(Math.round(kps2[k].pt.y))
		}

		wasmScore = wasmMatches.getScore(points1, points2)


		pointsCv.delete()

		// console.log("level", i, "score", wasmScore, "all", points1from.length/2)
		desPointsCv.delete()
		score = score + wasmScore
	}

	return score
}

vs.scalePoints = function(points, scale){
    var newPoints = []
    for (var i = 0; i < points.length; i++){
        newPoints.push( [ points[i][0] / scale, points[i][1] / scale ] )
    }
    return newPoints
}


vs.getHomographyFrom4pointsMatches = function(pointsFrom, pointsTo, dist){
	var pointsFromArray = []
	var pointsToArray = []
	for (var i = 0 ; i < pointsFrom.length; i++){
		pointsFromArray.push(pointsFrom[i])
	}
	for (var i = 0 ; i < pointsTo.length; i++){
		pointsToArray.push(pointsTo[i])
	}

	var pointsFromCV = new cv.matFromArray(pointsFromArray.length/2, 2, cv.CV_32FC1, pointsFromArray)
	var pointsToCV   = new cv.matFromArray(pointsToArray.length/2, 2, cv.CV_32FC1, pointsToArray)
	var H = new cv.Mat();
	var mask = new cv.Mat();

	H = cv.findHomography(pointsFromCV, pointsToCV, cv.RANSAC, dist, mask)
	score = 0
	for (var i = 0; i < mask.rows; i++){
		if (mask.data[i] > 0){
			score = score + 1
		}
	}
	var allMatchesCount =  mask.data.length
	// console.log("homo score", score , all_matches_count)

	exactHomo = vs.findExactHomography(pointsFrom, pointsTo, mask, 0.5)
	if (exactHomo != null){
		H.delete()
		H = exactHomo
	}

	mask.delete(); pointsFromCV.delete(); pointsToCV.delete(); 
	
	return { "homo" : H, "score" : score, "count" : allMatchesCount }
}

vs.findExactHomography = function(pointsFrom, pointsTo, mask, dist){
	var pointsFromArray = []
	var pointsToArray = []

	for (var i = 0 ; i < mask.rows; i++){
		if (mask.data[i] > 0){
			pointsFromArray.push(pointsFrom[2*i])
			pointsFromArray.push(pointsFrom[2*i+1])

			pointsToArray.push(pointsTo[2*i])
			pointsToArray.push(pointsTo[2*i+1])
		}
	}

	var pointsFromCV = new cv.matFromArray(pointsFromArray.length/2, 2, cv.CV_32FC1, pointsFromArray)
	var pointsToCV   = new cv.matFromArray(pointsToArray.length/2, 2, cv.CV_32FC1, pointsToArray)
	var H = new cv.Mat();
	var nMask = new cv.Mat();

	var H = cv.findHomography(pointsFromCV, pointsToCV, cv.RANSAC, dist, nMask)
	var score = 0
	for (var i = 0; i < nMask.rows; i++){
		if (nMask.data[i] > 0){
			score = score + 1
		}
	}
	// console.log("good", score, "/", nMask.rows)
	nMask.delete(); pointsFromCV.delete(); pointsToCV.delete();

	return H
}


vs.correctHomoWithBoundsOffsets = function(homo, offsetX1, offsetY1, offsetX2, offsetY2, boundsWidth, boundsHidth){
	var jsPointsFromBounds1 = [boundsWidth * 0.2, boundsHidth * 0.2,  
							boundsWidth * 0.8, boundsHidth * 0.2, 
							boundsWidth * 0.8, boundsHidth * 0.8, 
							boundsWidth * 0.2, boundsHidth * 0.8]

	var jsPointsFromFrame1 = [boundsWidth * 0.2 + offsetX1, boundsHidth * 0.2 + offsetY1,  
							boundsWidth * 0.8 + offsetX1, boundsHidth * 0.2 + offsetY1, 
							boundsWidth * 0.8 + offsetX1, boundsHidth * 0.8 + offsetY1, 
							boundsWidth * 0.2 + offsetX1, boundsHidth * 0.8 + offsetY1]


	var cvPointsFromBounds1 = new cv.matFromArray( jsPointsFromBounds1.length, 1, cv.CV_32FC2, jsPointsFromBounds1)
	var cvPointsFromBounds1InBounds2 = new cv.Mat();
	cv.perspectiveTransform(cvPointsFromBounds1, cvPointsFromBounds1InBounds2, homo)

	var jsPointsFromFrame2 = [ cvPointsFromBounds1InBounds2.data32F[0] + offsetX2, cvPointsFromBounds1InBounds2.data32F[1] + offsetY2, 
								cvPointsFromBounds1InBounds2.data32F[2] + offsetX2, cvPointsFromBounds1InBounds2.data32F[3] + offsetY2,
								cvPointsFromBounds1InBounds2.data32F[4] + offsetX2, cvPointsFromBounds1InBounds2.data32F[5] + offsetY2,
								cvPointsFromBounds1InBounds2.data32F[6] + offsetX2, cvPointsFromBounds1InBounds2.data32F[7] + offsetY2]

	var frameHomo = new cv.Mat();

	var cvPointsFromFrame1 = new cv.matFromArray( jsPointsFromFrame1.length/2, 2, cv.CV_32FC1, jsPointsFromFrame1)
	var cvPointsFromFrame2 = new cv.matFromArray( jsPointsFromFrame2.length/2, 2, cv.CV_32FC1, jsPointsFromFrame2)
	
	frameHomo = cv.findHomography(cvPointsFromFrame1, cvPointsFromFrame2)

	cvPointsFromFrame1.delete(); cvPointsFromFrame2.delete(); cvPointsFromBounds1.delete(); cvPointsFromBounds1InBounds2.delete()

	return frameHomo
}

