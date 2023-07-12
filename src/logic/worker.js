import  {cv}  from 'src/logic/opencv.js' 
import {wasmMatches} from 'src/logic/wasmModule.js'
// import {pj} from 'src/logic/projective.js'
import {vs} from 'src/logic/vision.js'
import {Collection, getPointsFromKpsDescriptors} from 'src/logic/collection.js'
// import {constraintsSinglton} from 'src/logic/constants.js'

let orbLevels = 1
let orbMul = 1.2
let maxPointsCount = 200
let success = true

let orb
let mask
let collection
let kps0 
let kps1
let kps2
let decs1
let decs2
let prevHomo

function tryOpenCVLoop(){
    try {
        var testORB = new global.cv.ORB(400, 1, 1);
        ready()
    } catch (err) {
        // console.log(err)
        setTimeout(tryOpenCVLoop, 100);
    }
}

function ready(){
    orb = new global.cv.ORB(maxPointsCount, orbMul, orbLevels);
    mask = new global.cv.Mat()
    console.log("getFastThreshold1", orb.getFastThreshold())
    self.postMessage( { aTopic:'cvReady'} );
}

setTimeout(tryOpenCVLoop, 100);

async function initWebAssampility(buffer){
    const obj = await WebAssembly.instantiate(buffer);
    // console.log(obj)
    wasmMatches.fetchAndInstantiateWebAssembly(obj)
}

self.onmessage = function (msg) {
    // console.log(msg)
    switch (msg.data.cmd) {
        case 'process':
            let visionAns = vision(msg.data.buf,  msg.data.curBounds, msg.data.scale, msg.data.points, msg.data.isRestart)
            self.postMessage( 
                { aTopic:'process' , 
                points : visionAns.points, 
                success : success, 
                // pointsCount : pointsCount,
                log : visionAns.log
            });
            // console.log(msg.data)
            break;

        case 'constraints':
            // console.log(msg.data)
            break;

        case 'wasm':
            initWebAssampility(msg.data.wasm)
            break;

        case 'callback':

            self.postMessage( 
                { aTopic:'callback' }
                ); 

            break;
        default:
            throw 'tag not found';
    }
}




function vision(buffer, curBounds, scale, followPointsJsNoScaled, isRestart){
    // console.log("vision")
    let logLine = ""
    let pointsStart = Date.now();
    let followPointsJs = vs.scalePoints(followPointsJsNoScaled, scale)
    let followPoints = vs.jsPointsToCv32(followPointsJs)
    // console.log(followPointsJsNoScaled)
    let matRgbRawNoScaled = new global.cv.Mat(curBounds.height, curBounds.width, global.cv.CV_8UC4);
    matRgbRawNoScaled.data.set(new Uint8Array(buffer));
    let matRgbRaw = new global.cv.Mat(curBounds.height / scale, curBounds.width / scale, global.cv.CV_8UC4);
    global.cv.resize(matRgbRawNoScaled, matRgbRaw, new global.cv.Size(curBounds.width / scale, curBounds.height / scale))
    let matGrayRaw = new global.cv.Mat(curBounds.height, curBounds.width, global.cv.CV_8UC1);
    global.cv.cvtColor(matRgbRaw, matGrayRaw,  global.cv.COLOR_RGBA2GRAY, 0);

    let curKp0 = new global.cv.KeyPointVector();
    let curDes0 = new global.cv.Mat();
    let curKp1 = new global.cv.KeyPointVector();
    let curDes1 = new global.cv.Mat();

    let mat0 = new global.cv.Mat();
    let mat1 = new global.cv.Mat();

    global.cv.resize(matGrayRaw, mat0, new global.cv.Size(curBounds.width / (2 * scale), curBounds.height / (2 * scale)))
    global.cv.equalizeHist(mat0, mat1)

    let orbT1 = Date.now();
    orb.detectAndCompute(matGrayRaw, mask, curKp0, curDes0);
    orb.detectAndCompute(mat1, mask, curKp1, curDes1);
    let orbT2 = Date.now();

    let points = getPointsFromKpsDescriptors([curKp0, curKp1], [curDes0, curDes1], 2)

    let lev0NewPointsCount = curKp0.size()
    let lev1NewPointsCount = curKp1.size()

    // console.log(lev0NewPointsCount, lev1NewPointsCount, mat1.size())

    // console.log(points)
    matRgbRaw.delete(); matGrayRaw.delete(); mat0.delete(); mat1.delete(); curKp0.delete(); curKp1.delete(); curDes0.delete(); curDes1.delete(); matRgbRawNoScaled.delete()
    
    let pointsEnd = Date.now();

    if (isRestart){
        collection = null
    }

    if (collection == null){
        // console.log("points1", points)
        collection = new Collection(points, curBounds)
        
    } else {

        let homoTimeS = Date.now();
        let colAns = collection.getHomoWithNewPoints(points, true)
        let homoTimeE = Date.now();
        if (colAns == null){
            success = false
            // console.log("null homo")
            logLine = logLine + "fail "
            // console.log("points2", points)
            collection = new Collection(points, curBounds)
        } else {
            success = true
            var frameHomo = vs.correctHomoWithBoundsOffsets(colAns.homo, collection.bounds.minX / scale, collection.bounds.minY / scale, 
            curBounds.minX / scale, curBounds.minY / scale, curBounds.width / scale, curBounds.height / scale)
            let homoTimeC = Date.now();
            followPoints = vs.pointPerspectiveTransform(followPoints, frameHomo)
            let homoTimePP = Date.now();
            // console.log("points2", points, colAns.homo, 3, curBounds)
            collection.updateCollectionWithNewPointsAndHomo(points, colAns.homo, 3, curBounds)
            let homoTimeU = Date.now();
            colAns.homo.delete(); frameHomo.delete()
        }

        // console.log("c upd", homoTimeU-homoTimePP, "get homo", homoTimeE-homoTimeS)
    }



    let collectionTimeEnd = Date.now();

    logLine = logLine + "time " + (orbT2-orbT1) + " / " + (pointsEnd - pointsStart) +" "+ (collectionTimeEnd - pointsEnd)
    logLine = logLine +" "+ lev0NewPointsCount +" "+ lev1NewPointsCount +" "+ collection.pointsByLevel[0].length +" "+ collection.pointsByLevel[1].length
    // console.log("time", orbT2-orbT1, "/", pointsEnd - pointsStart, collectionTimeEnd - pointsEnd, curKp0.size(), curKp1.size())

    let jsPointsScaled = vs.cvPointsToJs(followPoints)
    let jsPoints = vs.scalePoints(jsPointsScaled, 1 / scale)

    followPoints.delete(); 
    
    // console.log(jsPoints)
    // console.log("time", collectionTimeEnd-pointsStart)

    return { points : jsPoints, log : logLine}
}

