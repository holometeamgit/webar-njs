import {boundsWidth, 
	boundsHeight, 
	calkedCameraPosition, 
	filteredCalkedCameraPosition,
	angleX,
	angleY,
	angleZ,
	loopTimeout,
	cameraFrameTimeout} from './constrains'

let squarePoints = null
let isTracking = false
let workerReady = false
let isRestart = false
var preVisionTime = ""
var startWorker = 0

//image worker to work with image data and calculate change of camera position
var visionWorker = new Worker("src/worker.js");

function handleMessageFromWorker(msg) {
    switch (msg.data.aTopic) {
        case "doSendMainArrBuff":
        	// console.log("get message from woker")
            break;
        case "ready":
        	debag.innerText = "ready"
        	workerReady = true
        	break;
        case "process":
        	// draw.clearCanvas()
        	squarePoints = msg.data.points
        	// changedCameraPositioLog = ""
        	// draw.drawJspointsInCtx(squarePoints, 10, [0, 255, 0])

        	if (msg.data.success){
        		
        		newCalkedCameraPosition = pj.getCameraPositionWithSquarePoints(angleX, angleY, angleZ, squarePoints)
        		calkedCameraPosition = newCalkedCameraPosition
        		updateFilteredCalkedCameraPosition(calkedCameraPosition)
        		// console.log(squarePoints)
        		
        	}

        	hiddenCanvasCtx.drawImage(bufferCanvas, 0, 0)

        	// get squarePoints with new position (it reduce errors of points position)
        	squarePoints = pj.getStartPointsWithCameraPosition(calkedCameraPosition, angleX, angleY, angleZ)
        	log1.innerText = "tracking " + isTracking + " " + preVisionTime + " " + (Date.now() - startWorker) + " " + msg.data.log 
        	setTimeout(runInBackground, loopTimeout);
        	break;

        default:
            throw "unknown title in message";
    }
}

visionWorker.addEventListener("message", handleMessageFromWorker);

//get image data buffere which we send to the worker
function getBuffer(){
	var curBoundsInVideo = vs.getBoundsJs(squarePoints, vidWidth, vidHeight/2, vidWidth, vidHeight, 1)
	var imData = bufferCanvasCtx.getImageData(curBoundsInVideo.minX, curBoundsInVideo.minY, curBoundsInVideo.width, curBoundsInVideo.height).data 
	return imData.buffer
}


// main method to get image data resize it and send to WebWorker


// when user tap on screen to place axies (see main.js EventListeneres) we calculate 3D position and projection in frame points near start of axies
function initTracking(x, y){
	//position in frame
	var frameX = x / drawCanvas.width * vidWidth
	var frameY = y / drawCanvas.height * vidHeight
	// square points near start of axies (four points of each angle of square)
	squarePoints = pj.getStartPointsWithCameraPosition(calkedCameraPosition, angleX, angleY, angleZ)
	// calkulated camera position
	var cp = pj.getCameraPositionWithSquarePoints(angleX, angleY, angleZ, squarePoints)
	// smoothed calkulated camera position (remove shaking)
	filteredCalkedCameraPosition = [new KalmanFilter(cp[0], 0.75), new KalmanFilter(cp[1], 0.75), new KalmanFilter(cp[2], 0.75)]
	
	if (isTracking == false){
		state = 0
		isTracking = true
		// videoToShow.play();
	}
}

// if start of axis is not in camera frame position of camera is not update, if start of axis appears in frame we restart tracking
function updateTrackingStateAndCheckRestart(){

	var isVisible = pj.checkIfVisibleAxis(calkedCameraPosition, angleX, angleY, angleZ)
	if ( (isVisible == false) && (isTracking)  ){ // && (Math.abs(angleX) > 0.5)
		isTracking = false
	}
	if ( (isVisible) && (isTracking == false) ){
		isTracking = true
		return true
	}
	return false
}

// we have calked camera position but it shaking and we need to smooth it, smoothed position is filteredCalkedCameraPosition
function updateFilteredCalkedCameraPosition(curCalkedCameraPosition){
	filteredCalkedCameraPosition[0].addNewValue(curCalkedCameraPosition[0])
	filteredCalkedCameraPosition[1].addNewValue(curCalkedCameraPosition[1])
	filteredCalkedCameraPosition[2].addNewValue(curCalkedCameraPosition[2])
}


