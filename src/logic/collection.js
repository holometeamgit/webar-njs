import {vs} from 'src/logic/vision.js'
import {wasmMatches} from 'src/logic/wasmModule.js'

class Point {
  constructor(coordinate, level, descriptor, score) {
    this.coordinate = coordinate
    this.descriptor = descriptor
    this.level = level
    this.score = score
  }
}



class Collection {
  constructor(firstPointsByLevel, bounds) {
    this.pointsByLevel = firstPointsByLevel;
    this.bf = new cv.BFMatcher(cv.NORM_HAMMING); //, crossCheck = true
    this.bounds = bounds
    this.maxScore = 5
  }

  updatePointsWithHomo(curHomo){

  	for ( var level = 0; level < this.pointsByLevel.length; level++ ){
  		var levelPoints = []
  		for ( var i = 0; i < this.pointsByLevel[level].length; i++ ){
  			levelPoints.push(this.pointsByLevel[level][i].coordinate)
  		} 
  		// console.log("levelPoints", levelPoints.length)
		if (levelPoints.length === 0){
			continue
		}
  		var levelPointsCV = vs.jsPointsToCv32(levelPoints)
  		// console.log("levelPointsCV", levelPointsCV)
  		var levelPointsCVafterHomo = vs.pointPerspectiveTransform(levelPointsCV, curHomo)
  		// console.log("levelPointsCVafterHomo", levelPointsCVafterHomo)
  		for ( var i = 0; i < this.pointsByLevel[level].length; i++ ){
  			this.pointsByLevel[level][i].coordinate = [levelPointsCVafterHomo.data32F[i*2], levelPointsCVafterHomo.data32F[i*2+1]]
  		} 
  	}
  }

  calkDistance2(point1, point2){
  	return (Math.round(point1.coordinate[0])-point2.coordinate[0])*(Math.round(point1.coordinate[0])-point2.coordinate[0])+(Math.round(point1.coordinate[1])-point2.coordinate[1])*(Math.round(point1.coordinate[1])-point2.coordinate[1])
  }

  findClosestPoint(point, points){
  	var minDist = this.calkDistance2(point, points[0])
  	var minDistPointInd = 0
  	for ( var i = 0; i < points.length; i++ ){
  		var curDist = this.calkDistance2(point, points[i])
  		if (curDist < minDist){
  			minDist = curDist
  			minDistPointInd = i
  		}
  	}
  	return {
  		minDist : minDist,
  		minDistPointInd : minDistPointInd
  	}
  }

  updateScoresWasm(curNewPoints, curMaxDist){
    var matches = wasmMatches.getAllNeighbourMatches(this.pointsByLevel, curNewPoints, curMaxDist)
    for ( var level = 0; level < this.pointsByLevel.length; level++ ){
      var maskNewPointsLevel = Array(curNewPoints[level].length).fill(0)
      var maskCollectionPointsLevel = Array(this.pointsByLevel[level].length).fill(0)
      for (var i = 0; i < matches[level].length/2; i++){
        var curMatchFrom = matches[level][i*2]
        var curMatchTo = matches[level][i*2+1]
        maskCollectionPointsLevel[curMatchFrom]=1
        maskNewPointsLevel[curMatchTo]=1

        if (this.pointsByLevel[level][curMatchFrom].score < this.maxScore){
          this.pointsByLevel[level][curMatchFrom].score = this.pointsByLevel[level][curMatchFrom].score + 1 
        }
        this.pointsByLevel[level][curMatchFrom].descriptor = curNewPoints[level][curMatchTo].descriptor
        this.pointsByLevel[level][curMatchFrom].coordinate = curNewPoints[level][curMatchTo].coordinate
      }

      for (var i = 0; i < maskCollectionPointsLevel.length; i++){
        if (maskCollectionPointsLevel[i] == 0){
          this.pointsByLevel[level][i].score = this.pointsByLevel[level][i].score - 1
        }
      }

      for (var i = 0; i < maskNewPointsLevel.length; i++){
        if (maskNewPointsLevel[i] == 0){
          this.pointsByLevel[level].push(curNewPoints[level][i])
        }
      }
    }
  }

  deleteNegativePoints(){
  	for ( var level = 0; level < this.pointsByLevel.length; level++ ){
  		var delInds = []
  		for (var i = 0; i <  this.pointsByLevel[level].length; i++){
  			if (this.pointsByLevel[level][i].score < 0){
  				delInds.push(i)
  			}
  		}

  		delInds.reverse()

  		for (var i = 0; i <  delInds.length; i++){
  			this.pointsByLevel[level].splice(delInds[i], 1);
  		}
  	}
  }

  updateCollectionWithNewPointsAndHomo(curNewPoints, curHomo, curMaxDist, bounds){
  	this.bounds = bounds
  	this.updatePointsWithHomo(curHomo)
  	this.updateScoresWasm(curNewPoints, curMaxDist)
  	this.deleteNegativePoints()
  }

  getHomoWithFilter(curPointsToFilter){

  	var filteredMatchesAnswer = wasmMatches.getAllFilteredMatches(curPointsToFilter, 3)
  	var startInd = Math.max(filteredMatchesAnswer.scoresArray[0], Math.ceil(filteredMatchesAnswer.scoresArray.length/3) )
  	var searchInds = []

  	if (70 < filteredMatchesAnswer.scoresArray.length){
  		searchInds.push( 70 )
  	}
  	if (100 < filteredMatchesAnswer.scoresArray.length){
  		searchInds.push( 100 )
  	}

  	for (var i = 0; i < 4; i++){
  		if (startInd+i*5 < filteredMatchesAnswer.scoresArray.length){
  			searchInds.push( startInd + i * 5 )
  		}
  	}

  	var outputHomo = null
    var detMaxDist = 0.2
    var mScore = -1

    for (var i = 0; i < searchInds.length; i++){

		var homoAns = vs.getHomographyFrom4pointsMatches(filteredMatchesAnswer.pointsFrom.slice(0, searchInds[i]*2), filteredMatchesAnswer.pointsTo.slice(0, searchInds[i]*2), 2)

		if (homoAns.homo == null){
			continue
		}

		var curDet = cv.determinant(homoAns.homo)

		if (Math.abs(1-curDet) < detMaxDist){
			  return { homo : homoAns.homo, score : homoAns.score }
		  } 
    }
  }

  getHomoWithNewPoints(curNewPoints, isFilter){
  	// console.log("getHomoWithNewPoints")
  	var matchTimeS = Date.now();
  	var pointsTo = []
  	var pointsFrom = []
  	var pointsToFilter = []
  	for ( var level = 0; level < this.pointsByLevel.length; level++ ){
  		var levelMatchPrepTimeS = Date.now();
  		var curLevelCollectionDescriptors = []
  		for (var i = 0; i < this.pointsByLevel[level].length; i++){
  			curLevelCollectionDescriptors.push(this.pointsByLevel[level][i].descriptor)
  		}
  		var curLevelNewPointsDescriptors = []
  		for (var i = 0; i < curNewPoints[level].length; i++){
  			curLevelNewPointsDescriptors.push(curNewPoints[level][i].descriptor)
  		}
  		var levelMatchPrepTimeE = Date.now();
  		var levelMatchesVec = new cv.DMatchVector();
  		var decs1 = vs.createSceneDescriptorsCvobject(curLevelNewPointsDescriptors)
  		var decs2 = vs.createSceneDescriptorsCvobject(curLevelCollectionDescriptors)
  		var levelMatchPrepTimeE2 = Date.now();
  		this.bf.match(decs1, decs2, levelMatchesVec);
  		var levelMatchTimeE = Date.now();
  		for (var i = 0; i < levelMatchesVec.size(); i++){

  			pointsToFilter.push( this.pointsByLevel[level][levelMatchesVec.get(i).trainIdx].coordinate[0] )
  			pointsToFilter.push( this.pointsByLevel[level][levelMatchesVec.get(i).trainIdx].coordinate[1] )

  			pointsToFilter.push( curNewPoints[level][levelMatchesVec.get(i).queryIdx].coordinate[0] )
  			pointsToFilter.push( curNewPoints[level][levelMatchesVec.get(i).queryIdx].coordinate[1] )

  			pointsFrom.push( this.pointsByLevel[level][levelMatchesVec.get(i).trainIdx].coordinate[0] )
  			pointsFrom.push( this.pointsByLevel[level][levelMatchesVec.get(i).trainIdx].coordinate[1] )

  			pointsTo.push( curNewPoints[level][levelMatchesVec.get(i).queryIdx].coordinate[0] )
  			pointsTo.push( curNewPoints[level][levelMatchesVec.get(i).queryIdx].coordinate[1] )
  		}
  		levelMatchesVec.delete(); decs1.delete(); decs2.delete()
  		var levelOutputTimeE = Date.now();

  	}

  	var matchTimeE = Date.now();

  	if (isFilter){
  		var hAns = this.getHomoWithFilter(pointsToFilter)
  		var hTimeE = Date.now();
  		// console.log("match", matchTimeE - matchTimeS, "homo", hTimeE-matchTimeE)
  		return hAns
  	} 

  	var hAns = getHomographyFrom4pointsMatches(pointsFrom, pointsTo, 2)
    
  	return hAns
  }
}

function getPointsFromKpsDescriptors(kps, descriptors, mult){
	var firstDes = descriptors[0]
	var points = []
	for ( var level = 0; level < descriptors.length; level++ ){
		var levelPoints = []
		for ( var i = 0; i < descriptors[level].rows; i++ ){
			var curPt = kps[level].get(i).pt
      // console.log("curPt.x", curPt.x)
			var curX = new Number(curPt.x)
			var curY = new Number(curPt.y) //[curX, curY]
      if (level > 0){
        // console.log("mult", mult, Math.pow(mult, level))
        curX = curX * Math.pow(mult, level)
        curY = curY * Math.pow(mult, level)
      }
			var newPoint = new Point( [curX, curY], level,  vs.getDescriptorFromDesriptorsArray(descriptors[level], i), 2)
			levelPoints.push(newPoint)
		}
		points.push(levelPoints)
	}
	return points
}


export {Collection, getPointsFromKpsDescriptors}