let vidWidth = 720;
let vidHeight = 1280;

let boundsWidth = vidWidth
let boundsHeight = vidHeight/2

 // 1920 1080     1280 720
let fx = 610 * vidWidth / 640
let fy = -fx

let cx = vidWidth / 2
let cy = vidHeight / 2

var logText = document.getElementById("textID");
var video = document.getElementById("webcam")

video.width = vidWidth
video.height = vidHeight

var debag = document.getElementById("debag")
// debag.style.zIndex = "100";
var log1  = document.getElementById("info1")
// log1.style.zIndex = "100";
var tapButton  = document.getElementById("tapButton")

 // video: {width: {exact: 1280}, height: {exact: 720}}
var deviceFps = 30

var constraintsAll = { video: { facingMode: "environment", frameRate: { ideal: deviceFps, max: deviceFps } }, audio: false };
var constraintsHd = { video: { facingMode: "environment" , 
								width: {exact: vidHeight  }, // 960 540
								height: {exact: vidWidth },
								frameRate: { ideal: deviceFps, max: deviceFps }
								}, 
					audio: false };

var globalTranslationVector = [0, 0, -15]
var globalAngleY = 0
var globalAngleX = - Math.PI/ 4

var cameraAngleX = new KalmanAngleFilter(180, 0.85)
var cameraAngleY = new KalmanAngleFilter(180, 0.85)
var cameraAngleZ = new KalmanAngleFilter(180, 0.85)

let accelerometerIsGranted = false

var calkedCameraPosition = null
var filteredCalkedCameraPosition = null

let angleX = 0
let angleY = 0
let angleZ = 0

let loopTimeout = 15
let cameraFrameTimeout = 40

var hiddenCanvas = document.createElement('canvas');
hiddenCanvas.id = "hiddenCanvas";
hiddenCanvas.width = vidWidth;
hiddenCanvas.height = vidHeight;
hiddenCanvas.style.position = "absolute"
hiddenCanvas.style.left = 0
hiddenCanvas.style.top = 0
hiddenCanvas.style.display="none";
document.body.appendChild(hiddenCanvas);
var hiddenCanvasCtx = hiddenCanvas.getContext("2d");

var bufferCanvas = document.createElement('canvas');
bufferCanvas.id = "bufferCanvas";
bufferCanvas.width = vidWidth;
bufferCanvas.height = vidHeight;
bufferCanvas.style.position = "absolute"
bufferCanvas.style.left = 0
bufferCanvas.style.top = 0
bufferCanvas.style.display="none";
document.body.appendChild(bufferCanvas);
var bufferCanvasCtx = bufferCanvas.getContext("2d");

var drawCanvas = document.createElement('canvas');
drawCanvas.id = "drawCanvas";
drawCanvas.width = window.innerWidth;
drawCanvas.height = window.innerHeight;
drawCanvas.style.position = "absolute"
drawCanvas.style.left = 0
drawCanvas.style.top = 0
document.body.appendChild(drawCanvas);
var drawCanvasCtx = drawCanvas.getContext("2d");
drawCanvas.style.zIndex = "-1";

drawCanvasCtx.fillStyle = "green";
drawCanvasCtx.fillRect(0, 0, 400, 50);
