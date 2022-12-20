console.log("from worker")

self.importScripts('opencvF10WebWorker.js');
self.importScripts('wasm.js');
self.importScripts('projective.js');
self.importScripts('vision.js');
self.importScripts('collection.js');
self.importScripts('numeric-1.2.6.min.js');
// self.importScripts('projective.js');

let orbLevels = 1
let orbMul = 1.2
let maxPointsCount = 250
let isReady = false
let failCount = 0
let minPointsCount = 50
let minFailCount = 2
let state = 0
let homoErr = 20
// let width = 480;
// let height = 640;
let success = true
let maxDistChange = 0.5

var pointsCount = 0
var curHomoDist = 0

// var hmPointsMeanDist12 = { dx:0, dy: 0}
// var hmPointsMeanDist13 = { dx:0, dy: 0}
// var hmPointsMeanDist23 = { dx:0, dy: 0}

// var oldAngles = [0, 0, 0]
// var newAngles = [0, 0, 0]

let kps0 = null
let kps1 = null
let kps2 = null
let decs1 = null
let decs2 = null
let prevHomo = null
let collection = null

cv.onRuntimeInitialized = async () => {
    console.log('📦OpenCV runtime loaded from worker');

    orb = new cv.ORB(maxPointsCount, orbMul, orbLevels);
    matcher = new cv.BFMatcher(cv.NORM_HAMMING, crossCheck = true);
    isReady = true
    mask = new cv.Mat()
    eyeHomo = new cv.matFromArray( 3, 3, cv.CV_64FC1, [1, 0, 0, 0, 1, 0, 0, 0, 1])
    self.postMessage( { aTopic: 'ready' });
};


self.onmessage = function (msg) {
    // console.log(msg)
    switch (msg.data.cmd) {
        case 'test':
          break;

        case 'process': //msg.data.curBounds.width, msg.data.curBounds.height,
          var visionAns = vision(msg.data.buf,  msg.data.curBounds, msg.data.scale, msg.data.points, msg.data.isRestart)
          
          self.postMessage( 
            { aTopic:'process' , 
            points : visionAns.points, 
            success : success, 
            pointsCount : pointsCount,
            log : visionAns.log
        });
          break;

        default:
            throw 'свойство aTopic отсутствует в сообщении ChromeWorker';
    }
}

function vision(buffer, curBounds, scale, followPointsJsNoScaled, isRestart){
    
    var logLine = ""
    pointsStart = Date.now();
    var followPointsJs = vs.scalePoints(followPointsJsNoScaled, scale)
    var followPoints = vs.jsPointsToCv32(followPointsJs)
    var matRgbRawNoScaled = new cv.Mat(curBounds.height, curBounds.width, cv.CV_8UC4);
    matRgbRawNoScaled.data.set(new Uint8Array(buffer));

    var matRgbRaw = new cv.Mat(curBounds.height / scale, curBounds.width / scale, cv.CV_8UC4);

    cv.resize(matRgbRawNoScaled, matRgbRaw, new cv.Size(curBounds.width / scale, curBounds.height / scale))

    var matGrayRaw = new cv.Mat(curBounds.height, curBounds.width, cv.CV_8UC1);
    cv.cvtColor(matRgbRaw, matGrayRaw, cv.COLOR_RGBA2GRAY, 0);
    var curKp0 = new cv.KeyPointVector();
    var curDes0 = new cv.Mat();
    var curKp1 = new cv.KeyPointVector();
    var curDes1 = new cv.Mat();

    var mat0 = new cv.Mat();
    var mat1 = new cv.Mat();

    // cv.equalizeHist(matGrayRaw, mat0)
    // cv.resize(mat0, mat1, new cv.Size(width/2, height/2))

    cv.resize(matGrayRaw, mat0, new cv.Size(curBounds.width / (2 * scale), curBounds.height / (2 * scale)))
    cv.equalizeHist(mat0, mat1)

    var orbT1 = Date.now();
    orb.detectAndCompute(matGrayRaw, mask, curKp0, curDes0);
    orb.detectAndCompute(mat1, mask, curKp1, curDes1);
    var orbT2 = Date.now();

    points = getPointsFromKpsDescriptors([curKp0, curKp1], [curDes0, curDes1], 2)

    var lev0NewPointsCount = curKp0.size()
    var lev1NewPointsCount = curKp1.size()

    // console.log(points)
    matRgbRaw.delete(); matGrayRaw.delete(); mat0.delete(); mat1.delete(); curKp0.delete(); curKp1.delete(); curDes0.delete(); curDes1.delete(); matRgbRawNoScaled.delete()
    
    pointsEnd = Date.now();

    if (isRestart){
        collection = null
    }

    if (collection == null){
        collection = new Collection(points, curBounds)
        
    } else {

        homoTimeS = Date.now();
        colAns = collection.getHomoWithNewPoints(points, true)
        homoTimeE = Date.now();
        if (colAns == null){
            success = false
            // console.log("null homo")
            logLine = logLine + "fail "
            collection = new Collection(points, curBounds)
        } else {
            success = true
            var frameHomo = vs.correctHomoWithBoundsOffsets(colAns.homo, collection.bounds.minX / scale, collection.bounds.minY / scale, 
            curBounds.minX / scale, curBounds.minY / scale, curBounds.width / scale, curBounds.height / scale)
            homoTimeC = Date.now();
            followPoints = vs.pointPerspectiveTransform(followPoints, frameHomo)
            homoTimePP = Date.now();
            collection.updateCollectionWithNewPointsAndHomo(points, colAns.homo, 3, curBounds)
            homoTimeU = Date.now();
            colAns.homo.delete(); frameHomo.delete()
        }

        // console.log("c upd", homoTimeU-homoTimePP, "get homo", homoTimeE-homoTimeS)
    }



    collectionTimeEnd = Date.now();

    logLine = logLine + "time " + (orbT2-orbT1) + " / " + (pointsEnd - pointsStart) +" "+ (collectionTimeEnd - pointsEnd)
    logLine = logLine +" "+ lev0NewPointsCount +" "+ lev1NewPointsCount +" "+ collection.pointsByLevel[0].length +" "+ collection.pointsByLevel[1].length
    // console.log("time", orbT2-orbT1, "/", pointsEnd - pointsStart, collectionTimeEnd - pointsEnd, curKp0.size(), curKp1.size())

    var jsPointsScaled = vs.cvPointsToJs(followPoints)
    jsPoints = vs.scalePoints(jsPointsScaled, 1 / scale)

    followPoints.delete(); 

    // mat0.delete(); mat1.delete(); matRgbRaw.delete(); matGrayRaw.delete()

    return { points : jsPoints, log : logLine}
}


// wasm.fetchAndInstantiateWebAssembly()
wasmMatches.fetchAndInstantiateWebAssembly()

