let isInteractable =  false
startDist2Touches = 100



setTimeout(cameraStart, 500);
setTimeout(initAccelerometer, 500);
// console.log(DeviceOrientationEvent)
// console.log(DeviceOrientationEvent.requestPermission)
// console.log(typeof DeviceOrientationEvent)

function testTimer(){
	console.log("tap2")
	document.getElementById("tapButton").style.visibility = "hidden";
}

function initAccelerometer(){
	console.log("initAccelerometer")

	try {
		if (typeof DeviceOrientationEvent !== 'function') {
			debag.innerText = "1"
			isInteractable = true
			console.log("initAccelerometer1")
			// console.log(tapButton)
			// console.log(document.getElementById("tapButton").style["0"])
			tapButton.style.visibility='hidden'
			console.log("computer")
			return
			// console.log("DeviceOrientationEvent not")
		}
		if (typeof DeviceOrientationEvent.requestPermission !== 'function') {
			debag.innerText = "2"
			isInteractable = true
			console.log("initAccelerometer1")
			// console.log(tapButton)
			// console.log(document.getElementById("tapButton").style["0"])
			tapButton.style.visibility='hidden'
			console.log("computer")
			return
		}
	
		DeviceOrientationEvent.requestPermission().then(response => { 
			console.log("response", response)
			log1.innerText = response
			if (response == 'granted') {
				accelerometerIsGranted = true
				debag.innerText = "3"
				isInteractable = true
				tapButton.style.visibility='hidden'
				return
			} 
			 
			tapButton.style.visibility='visible'
		}).catch(error => { 
			console.log("error", error)
			debag.innerText = "4 " + isInteractable
			tapButton.style.visibility='visible'
			// console.log("+error+ ", error)  
			log1.innerText = error
		})
		// DeviceOrientationEvent.requestPermission().then(response => { }).catch(console.error)
	} catch (err) {
		debag.innerText = "5"
		console.log("err", err)
		// console.log("error ", err)
		// console.log("tut1", err)
		// tapButton.style.visibility='hidden'
		// isInteractable = false
		log1.innerText = err
		// tapButton.style.visibility='visible'
		
	}
}

function cameraStart() {
	try {

		navigator.mediaDevices.getUserMedia(constraintsHd).then(function(stream) {

		vs.getCameraSettings(stream)
		video.srcObject = stream;
		video.play();

	}).catch(function(error) {
		console.error("Camera Start getUserMedia hd error ", error);

		navigator.mediaDevices.getUserMedia(constraintsAll).then(function(stream) {
			vs.getCameraSettings(stream)
			video.srcObject = stream;
			video.play();

		}).catch(function(error) {
			console.error("Camera Start getUserMedia not hd error ", error);
		});

	});

	} catch (err) {
		console.error("Camera Start error ", err);

	}
	setTimeout(runInBackground, 500);
}

function tap(){
	initAccelerometer()
}

window.addEventListener('touchstart', function(e) {  
	// return
	console.log(e.touches.length)

	switch ( e.touches.length ) {
		case 1:
			if ( (isInteractable) && (workerReady)  && (accelerometerIsGranted) ){ //&& (mainOpenCvIsReady)

				var x = e.touches[0].clientX;
				var y = e.touches[0].clientY;
				
				var u = x / drawCanvas.width * vidWidth
				var v = y / drawCanvas.height * vidHeight

				let cameraP = pj.getCameraPositionWithZ(angleX, angleY, -angleZ, [u, v], [0, 0, 0], 4)
				calkedCameraPosition = cameraP.cameraPos

				
				initTracking(x, y)

				isInteractable = false
				break
			}
		case 2:
			if ( (isInteractable) && (workerReady)  && (accelerometerIsGranted) ){
		  	var x1 = e.touches[0].clientX;
			var y1 = e.touches[0].clientY;
			var x2 = e.touches[1].clientX; 
			var y2 = e.touches[1].clientY;
			startDist2Touches = ( x1 - x2 ) * ( x1 - x2 ) + ( y1 - y2 ) * ( y1 - y2 )
			break
		}
	}

}, false);

document.addEventListener('touchmove', function (event) {
	// return
	if (event.touches.length == 2){
		debag.innerText = "move1"
		var x1 = event.touches[0].clientX;
		var y1 = event.touches[0].clientY;
		var x2 = event.touches[1].clientX;
		var y2 = event.touches[1].clientY;
		var curDist2 = ( x1 - x2 ) * ( x1 - x2) + ( y1 - y2 ) * ( y1 - y2 )
		var scalVal = Math.sqrt(curDist2 / startDist2Touches)
		startDist2Touches = curDist2
		debag.innerText = scalVal
		scaleHologram(scalVal)
	}
	if (event.scale !== 1) { 
		event.preventDefault(); 
	}

}, { passive: false });



window.addEventListener('mousedown', function(e) {
	console.log("mousedown")
	return
	if ( !workerReady ){ //!mainOpenCvIsReady || (!workerReady)
		return
	}
	var x =  e.clientX;
	var y =  e.clientY;


	var u = x / drawCanvas.width * vidWidth 
	var v = y / drawCanvas.height * vidHeight
	let cameraP = pj.getCameraPositionWithZ(angleX, angleY, -angleZ, [u, v], [0, 0, 0], 10)
	calkedCameraPosition = cameraP.cameraPos

	if (isInteractable){
		initTracking(x, y)
		isInteractable = false
	}
})

window.addEventListener("deviceorientation", handleOrientation, true);

function handleOrientation(event) {
	var alpha    = event.alpha;
	var beta     = event.beta;
	var gamma    = event.gamma;

	window.globalAngleX = - beta  / 180.0 * Math.PI

	curAlpha = cameraAngleZ.addNewValue(alpha)
	curBeta = cameraAngleX.addNewValue(beta)
	curGamma = cameraAngleY.addNewValue(gamma)

	angleX = curBeta / 180 * Math.PI
	angleY = curGamma /  180 * Math.PI
	angleZ = curAlpha /  180 * Math.PI
	
}

// initAccelerometer()

