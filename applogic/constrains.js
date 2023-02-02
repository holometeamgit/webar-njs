export const vidWidth = 720;
export const vidHeight = 1280;

export const boundsWidth = vidWidth
export const boundsHeight = vidHeight/2

 // 1920 1080     1280 720
 export const fx = 610 * vidWidth / 640
 export const fy = -fx

 export const cx = vidWidth / 2
 export const cy = vidHeight / 2

const deviceFps = 30

export const constraintsAll = { video: { facingMode: "environment", frameRate: { ideal: deviceFps, max: deviceFps } }, audio: false };
export const constraintsHd = { video: { facingMode: "environment" , 
								width: {exact: vidHeight  }, // 960 540
								height: {exact: vidWidth },
								frameRate: { ideal: deviceFps, max: deviceFps }
								}, 
					audio: false };

export const cameraAngleX = new KalmanAngleFilter(180, 0.85)
export const cameraAngleY = new KalmanAngleFilter(180, 0.85)
export const cameraAngleZ = new KalmanAngleFilter(180, 0.85)

export let accelerometerIsGranted = false

export let calkedCameraPosition = null
export let filteredCalkedCameraPosition = null

export let angleX = 0
export let angleY = 0
export let angleZ = 0

export const loopTimeout = 15
export const cameraFrameTimeout = 40


// var logText = document.getElementById("textID");
// var debag = document.getElementById("debag")
// var log1  = document.getElementById("info1")

// var hiddenCanvas = document.createElement('canvas');
// hiddenCanvas.id = "hiddenCanvas";
// hiddenCanvas.width = vidWidth;
// hiddenCanvas.height = vidHeight;
// hiddenCanvas.style.position = "absolute"
// hiddenCanvas.style.left = 0
// hiddenCanvas.style.top = 0
// hiddenCanvas.style.display="none";
// document.body.appendChild(hiddenCanvas);
// var hiddenCanvasCtx = hiddenCanvas.getContext("2d");

// var bufferCanvas = document.createElement('canvas');
// bufferCanvas.id = "bufferCanvas";
// bufferCanvas.width = vidWidth;
// bufferCanvas.height = vidHeight;
// bufferCanvas.style.position = "absolute"
// bufferCanvas.style.left = 0
// bufferCanvas.style.top = 0
// bufferCanvas.style.display="none";
// document.body.appendChild(bufferCanvas);
// var bufferCanvasCtx = bufferCanvas.getContext("2d");

// var drawCanvas = document.createElement('canvas');
// drawCanvas.id = "drawCanvas";
// drawCanvas.width = window.innerWidth;
// drawCanvas.height = window.innerHeight;
// drawCanvas.style.position = "absolute"
// drawCanvas.style.left = 0
// drawCanvas.style.top = 0
// document.body.appendChild(drawCanvas);
// var drawCanvasCtx = drawCanvas.getContext("2d");
// drawCanvas.style.zIndex = "-1";

// drawCanvasCtx.fillStyle = "green";
// drawCanvasCtx.fillRect(0, 0, 400, 50);
