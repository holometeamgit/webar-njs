function debag_tap(){
	console.log("tap")
}

function debag_tap2(){
	console.log("tap2")
	document.getElementById("tapButton").style.visibility = "hidden";
}

var tapButton = document.getElementById("tapButton")
// tapButton.style.visibility='visible'
var video = document.getElementById("webcam")
// document.getElementById("tapButton").style.bottom = "100px";

// console.log(tapButton.style.bottom)
// tapButton.style.bottom = "100px"
// console.log(tapButton.style.bottom)

setTimeout(cameraStart, 1000);

var deviceFps = 30
let vidWidth = 720;
let vidHeight = 1280;

var constraintsAll = { video: { facingMode: "environment", frameRate: { ideal: deviceFps, max: deviceFps } }, audio: false };

var constraintsHd = { video: { facingMode: "environment" , 
								width: {exact: vidHeight  }, // 960 540
								height: {exact: vidWidth },
								frameRate: { ideal: deviceFps, max: deviceFps }
								}, 
					audio: false };

function cameraStart() {
	try {

		navigator.mediaDevices.getUserMedia(constraintsHd).then(function(stream) {

		// vs.getCameraSettings(stream)
		video.srcObject = stream;
		video.play();

	}).catch(function(error) {
		console.error("Camera Start getUserMedia hd error ", error);

		navigator.mediaDevices.getUserMedia(constraintsAll).then(function(stream) {
			// vs.getCameraSettings(stream)
			video.srcObject = stream;
			video.play();

		}).catch(function(error) {
			console.error("Camera Start getUserMedia not hd error ", error);
		});

	});

	} catch (err) {
		console.error("Camera Start error ", err);

	}
	// setTimeout(runInBackground, 500);
}