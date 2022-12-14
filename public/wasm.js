var wasmMatches = { };

wasmMatches.fetchAndInstantiateWebAssembly = async function(){
    const response = await fetch("MatchesNeighbourFilter4.wasm");
    const buffer = await response.arrayBuffer();
    const obj = await WebAssembly.instantiate(buffer);

    wasmMatches.createShortBufferWasm = obj.instance.exports.createShortBuffer
    wasmMatches.destroyShortBufferWasm = obj.instance.exports.destroyShortBuffer
    wasmMatches.setNeighbourMatchesWasm = obj.instance.exports.setNeighbourMatches
    wasmMatches.setSortedByDistanceScoresWasm = obj.instance.exports.setScoreByDistanceSortedArray

    wasmMatches.heap = new Int16Array(obj.instance.exports.memory.buffer);

}

wasmMatches.getArrayFromWasm = function(pointer, length){

    var output = []
    for (var i = 0; i < length; i++){
        output.push( wasmMatches.heap[ pointer / 2 + i] )
    }

    return output
}

wasmMatches.setArrayToWasm = function(array){
    var arrayPointer = wasmMatches.createShortBufferWasm(array.length)
    for (var i = 0; i < array.length; i++){
        wasmMatches.heap[ arrayPointer / 2 + i] = array[i] //Math.ceil(points_from[i])
    }
    return arrayPointer
}

wasmMatches.getAllFilteredMatches = function(pointsMatchesToFilter, maxDistance){
    var matchesCount = pointsMatchesToFilter.length / 4
    var pointsPointer = wasmMatches.setArrayToWasm(pointsMatchesToFilter)
    var scoresMatchesArrayPointer = wasmMatches.createShortBufferWasm(matchesCount * 2)

    wasmMatches.setSortedByDistanceScoresWasm(pointsPointer, matchesCount, scoresMatchesArrayPointer, maxDistance)
    var scoresMatchesArray = wasmMatches.getArrayFromWasm(scoresMatchesArrayPointer, matchesCount * 2)

    var pointsFrom = []
    var pointsTo = []
    var scoresArray = []

    for (var i = 0; i < matchesCount; i++){

        pointsFrom.push( pointsMatchesToFilter[scoresMatchesArray[i*2]*4] )
        pointsFrom.push( pointsMatchesToFilter[scoresMatchesArray[i*2]*4 + 1] )

        pointsTo.push(   pointsMatchesToFilter[scoresMatchesArray[i*2]*4 + 2] )
        pointsTo.push(   pointsMatchesToFilter[scoresMatchesArray[i*2]*4 + 3] )

        scoresArray.push( scoresMatchesArray[i*2+1] )
    }

    wasmMatches.destroyShortBufferWasm(pointsPointer)
    wasmMatches.destroyShortBufferWasm(scoresMatchesArrayPointer)

    return {
        pointsFrom : pointsFrom,
        pointsTo   : pointsTo,
        scoresArray : scoresArray
    } 
}


wasmMatches.getAllNeighbourMatches = function(collectionPoints, newPoints, maxDistance){
    var matches = []
    for (var level = 0; level < collectionPoints.length; level++){

        var pointsFrom = []
        for (var i = 0; i < collectionPoints[level].length; i++){
            pointsFrom.push( Math.round(collectionPoints[level][i].coordinate[0]) )
            pointsFrom.push( Math.round(collectionPoints[level][i].coordinate[1]) )
        }

        var pointsTo = []
        for (var i = 0; i < newPoints[level].length; i++){
            pointsTo.push( Math.round(newPoints[level][i].coordinate[0]) )
            pointsTo.push( Math.round(newPoints[level][i].coordinate[1]) )      
        }

        var pointsFromPointer = wasmMatches.setArrayToWasm(pointsFrom)
        var pointsToPointer = wasmMatches.setArrayToWasm(pointsTo)
        var matchesPointer = wasmMatches.createShortBufferWasm(pointsFrom.length)
        var matchesCount = wasmMatches.setNeighbourMatchesWasm(pointsFromPointer, pointsFrom.length, pointsToPointer, pointsTo.length, matchesPointer, 3)
        var levelMatches = wasmMatches.getArrayFromWasm(matchesPointer, matchesCount*2)

        matches.push(levelMatches)

        wasmMatches.destroyShortBufferWasm(pointsFromPointer)
        wasmMatches.destroyShortBufferWasm(pointsToPointer)
        wasmMatches.destroyShortBufferWasm(matchesPointer)
    }

    return matches
}


