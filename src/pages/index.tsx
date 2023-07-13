import React, { useRef, createRef, useEffect, useState } from "react";
import { WebcamVideo, HologramVideo } from '../Video'
// import { MainCanvas1 } from '../Scene'
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { PerspectiveCamera, useVideoTexture } from "@react-three/drei";
import css from "../styles/Home.module.css";
import * as THREE from 'three'
import { VideoTexture } from "three/src/Three";
import Worker from 'web-worker';
import {pj} from 'src/logic/projective.js'
import {vs} from 'src/logic/vision.js'
import {constraintsSinglton} from 'src/logic/constants.js'
import {isMobile} from 'react-device-detect';
import {KalmanFilter, KalmanAngleFilter} from 'src/logic/kalman.js'

const webcamRef = createRef();
const webcam = <WebcamVideo  vidRef={webcamRef}></WebcamVideo>

const hologramRef = createRef();
const hologram = <HologramVideo  vidRef={hologramRef}></HologramVideo>

let hologrameTexture : any

let drawCanvasRef : any
let canvasRef : any
let logRef : any
let sceneRef : any
let buttonRef : any

let squarePoints = null
let filteredCalkedCameraPosition = null
let curCameraPosition : any
let startDist2Touches = null

let isInteractable = true
let workerReady = false
let accelerometerIsGranted = false

const needDrawPoints = false
const needAxis = false

let angleX = 0
let angleY = 0
let angleZ = 0

var cameraAngleX = new KalmanAngleFilter(180, 0.85)
var cameraAngleY = new KalmanAngleFilter(180, 0.85)
var cameraAngleZ = new KalmanAngleFilter(180, 0.85)

const worker = new Worker(new URL('src/logic/worker.js', import.meta.url));
worker.addEventListener("message", handleMessageFromWorker);
worker.postMessage({ cmd: 'callback' })

function constraintsCallback(){
  drawCanvasRef.current.style.width = webcamRef.current.width.toString() + "px"
  drawCanvasRef.current.style.height = webcamRef.current.height.toString() + "px"

  drawCanvasRef.current.width = webcamRef.current.width
  drawCanvasRef.current.height = webcamRef.current.height
}

constraintsSinglton.addObserver(constraintsCallback)

  // we have calked camera position but it shaking and we need to smooth it, smoothed position is filteredCalkedCameraPosition
function updateFilteredCalkedCameraPosition(curCalkedCameraPosition){
    filteredCalkedCameraPosition[0].addNewValue(curCalkedCameraPosition[0])
    filteredCalkedCameraPosition[1].addNewValue(curCalkedCameraPosition[1])
    filteredCalkedCameraPosition[2].addNewValue(curCalkedCameraPosition[2])
}

function handleMessageFromWorker(msg) {
  switch (msg.data.aTopic) {
    case "process":
      clearCanvas()
      if (msg.data.success){
        squarePoints = msg.data.points
        let newCalkedCameraPosition = pj.getCameraPositionWithSquarePoints(angleX, angleY, angleZ, squarePoints)
        curCameraPosition = newCalkedCameraPosition
        updateFilteredCalkedCameraPosition(newCalkedCameraPosition)
        squarePoints = pj.getStartPointsWithCameraPosition(newCalkedCameraPosition, angleX, angleY, angleZ)
      }
      setTimeout(runInBackground, 10);
      break
    
    case "cvReady":
      // console.log("cvReady")
      logRef.current.innerText = "Ready"
      workerReady = true
      break

  }
}

async function initWebAssambility(){
  const response = await fetch("assets/MatchesNeighbourFilter4.wasm");
  const buffer = await response.arrayBuffer();
  worker.postMessage( { cmd: 'wasm', wasm: buffer } , [buffer] );
}

initWebAssambility()

function drawPoints(points){
  for (let i = 0; i < points.length; i++){
    const curPoint = points[i]
    drawPoint(curPoint[0], curPoint[1])
  }
}
function clearCanvas(){
  const drawCanvas = drawCanvasRef.current
  const drawCtx= drawCanvas.getContext('2d');
  drawCtx.clearRect(0, 0, drawCanvas.width, drawCanvas.height);
}

function drawPoint(x, y){
  const drawCtx= drawCanvasRef.current.getContext('2d');
  drawCtx.fillStyle = "blue";
  drawCtx.fillRect(x-5, y-5, 10, 10);
}

function runInBackground(){
  const constants = constraintsSinglton.getConstantsDict()
  const ctx= canvasRef.current.getContext('2d');
  const curBoundsInVideo = vs.getBoundsJs(squarePoints, constants.boundsWidth, constants.boundsHeight, constants.vidWidth, constants.vidHeight, 1)
  const imData = ctx.getImageData(curBoundsInVideo.minX, curBoundsInVideo.minY, curBoundsInVideo.width, curBoundsInVideo.height).data
  const buffer = imData.buffer

  worker.postMessage({cmd: 'process', buf: buffer, curBounds : curBoundsInVideo, scale : 2, isRestart : false,
  points : squarePoints, angles : [0, 0, 0] } , [buffer]); 
}

function requestAccelerometer(){
  if (typeof DeviceOrientationEvent.requestPermission !== 'function') {
      accelerometerIsGranted = true
      buttonRef.current.style.visibility = 'hidden'
			console.log("computer", accelerometerIsGranted)
			return true
  } else {
    DeviceOrientationEvent.requestPermission()
        .then((state) => {
          logRef.current.innerText = state
          if (state === 'granted') {
            window.addEventListener('deviceorientation', handleOrientation);
            accelerometerIsGranted = true
            buttonRef.current.style.visibility = 'hidden'
          } else {
            console.error('Request to access the orientation was rejected');
          }
      })
      .catch(console.error);
  }
}

export default function App() {
  canvasRef = useRef(null);
  drawCanvasRef = useRef(null);
  logRef = useRef(null)
  sceneRef = useRef(null)
  buttonRef = useRef(null)

  function drawVid(){

    canvasRef.current.width = webcamRef.current.width
    canvasRef.current.height = webcamRef.current.height

    constraintsCallback()

    if (squarePoints !== null){
      if (needDrawPoints){
        drawPoints(squarePoints)
      }
    }

    let ctx= canvasRef.current.getContext('2d');
    ctx.drawImage(webcamRef.current, 0, 0, webcamRef.current.width, webcamRef.current.height);
    requestAnimationFrame(drawVid)
  }

  useEffect(() => {
    hologramRef.current.load()
    hologramRef.current.pause()
    requestAccelerometer()
    drawVid()

    sceneRef.current.addEventListener('touchstart', function(e) {  
      switch ( e.touches.length ) {
        case 2:
          var x1 = e.touches[0].clientX;
          var y1 = e.touches[0].clientY;
          var x2 = e.touches[1].clientX; 
          var y2 = e.touches[1].clientY;
          startDist2Touches = ( x1 - x2 ) * ( x1 - x2 ) + ( y1 - y2 ) * ( y1 - y2 )
          break
      }
    })

    sceneRef.current.addEventListener('touchmove', function(e) {  
      // logRef.current.innerText = 'touchstart'
      switch ( e.touches.length ) {
        case 2:
          let x1 = e.touches[0].clientX;
          let y1 = e.touches[0].clientY;
          let x2 = e.touches[1].clientX;
          let y2 = e.touches[1].clientY;
          let curDist2 = ( x1 - x2 ) * ( x1 - x2) + ( y1 - y2 ) * ( y1 - y2 )
          if ( startDist2Touches !== null){
            let scalVal = Math.sqrt(curDist2 / startDist2Touches)
            startDist2Touches = curDist2
            logRef.current.innerText = scalVal
          }
          break
      }
    })

    sceneRef.current.addEventListener('mousedown', function(e) {  
      console.log(isInteractable, workerReady, accelerometerIsGranted)
      logRef.current.innerText = isInteractable + " " + workerReady + " " + accelerometerIsGranted
      if ( (isInteractable) && (workerReady)  && (accelerometerIsGranted) ){
        hologramRef.current.play()
        clearCanvas()
        const constants = constraintsSinglton.getConstantsDict()
        pj.setConstants(constants.fx, constants.fy, constants.cx, constants.cy)
        const x = e.clientX;
        const y = e.clientY;

        const u = (x  /  sceneRef.current.width) * constants.vidWidth * 2
			  const v = (y  /  sceneRef.current.height) * constants.vidHeight * 2

        console.log(sceneRef.current.width, sceneRef.current.height, u, v, x, y)

        const cameraP = pj.getCameraPositionWithZ(angleX, angleY, -angleZ, [u, v], [0, 0, 0], 4)
			  const calkedCameraPosition = cameraP.cameraPos
        let logLine = "x " + x + " y " + y + " " + sceneRef.current.width + " " + sceneRef.current.height + " " + window.innerHeight + " " +  window.innerWidth
        // logRef.current.innerText = logLine

        squarePoints = pj.getStartPointsWithCameraPosition(calkedCameraPosition, angleX, angleY, angleZ)
        curCameraPosition = cameraP.cameraPos
        filteredCalkedCameraPosition = [new KalmanFilter(cameraP.cameraPos[0], 0.75), new KalmanFilter(cameraP.cameraPos[1], 0.75), new KalmanFilter(cameraP.cameraPos[2], 0.75)]
        if (needDrawPoints){
          drawPoints(squarePoints)
        }
        runInBackground()
        isInteractable = false
      }
    })
  })

  function onClick() {
    requestAccelerometer()
  }
// {/* <Helmet>
//           {/* <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"> */}
//         </Helmet> */}
  return (
    // 
    <div className={css.scene} >
      {/* <Helmet>
        <meta name="viewport" content="initial-scale=1.0, maximum-scale=1.0, user-scalable=no"/>
      </Helmet> */}
      {hologram}
      {webcam}
      {/* style={{display:'none'}} , width: 960, height: 540 , width: 100, height: 200  , display:'none' pointer-events: none; width: 100, height: 200, width="100" height="100" */}
      {/* display:'none' , opacity: 0.3 , width: "100%", height: "100%"  width="540" height="960" background-color: white; dc , width: "100%", height: "100%" */} 
      <MainCanvas className={css.scene}  mainCanvasRef={sceneRef}/>
      <canvas ref={canvasRef}  style={{position: 'absolute', top: 0, left: 0, opacity: 0.3, display:'none'}} id="video_canvas"></canvas>
      <canvas ref={drawCanvasRef} style={{position: 'absolute', top: 0, left: 0,  pointerEvents: 'none', opacity: 0.3 }}  id="draw_canvas" ></canvas>
      <div ref={logRef}  style={{position: 'absolute', top: 10, left: 10, backgroundColor: "white" }}> loading  </div>  
      <button ref = {buttonRef} style={{position: 'absolute', top: "10%", left: "10%", width: "40%", height: 70 }} onClick={onClick}>Init Sensors</button>;
    </div>
  );
}

function handleOrientation(event) {
	let alpha    = event.alpha;
	let beta     = event.beta;
	let gamma    = event.gamma;

	let curAlpha = cameraAngleZ.addNewValue(alpha)
	let curBeta = cameraAngleX.addNewValue(beta)
	let curGamma = cameraAngleY.addNewValue(gamma)

	angleX = curBeta / 180 * Math.PI
	angleY = curGamma /  180 * Math.PI
	angleZ = curAlpha /  180 * Math.PI

  if (logRef != null){
    logRef.innerText = angleX.toString() + " " + angleY.toString() + " " + angleZ.toString()
  }
}




var backgroundWebCamTexture = null
const BeemShaderMaterial = {
  uniforms: {
    uTexture: {
      type: "t",
      value: null
    }
  },
  transparent: true,
  vertexShader: `
    precision mediump float;
    uniform sampler2D uTexture;
    varying vec2 vUv;
    void main() {
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.);
        gl_Position = projectionMatrix * mvPosition;
        vUv = uv;
    }
  `,

  fragmentShader: `
    varying vec2 vUv;
    uniform sampler2D uTexture;

    void main() {
      vec2 uv = vUv;

      vec3 tColor = texture2D( uTexture, vec2(vUv.x * 0.5, vUv.y)).rgb;
      vec3 mask = texture2D( uTexture, vec2(vUv.x * 0.5 + 0.5, vUv.y)).rgb;
      vec4 color1 = vec4(tColor.b * mask.g, tColor.g * mask.g, tColor.r * mask.g, mask.g);

      vec4 color = texture( uTexture, vec2(vUv.x * 0.5, vUv.y) );
      gl_FragColor = color1;
    }
  `
};

function cameraUpdate(curCamera, curScene, curDelta){
  if (filteredCalkedCameraPosition != null){
    const constants = constraintsSinglton.getConstantsDict()
    var isVisible = pj.checkIfVisibleAxis(curCameraPosition, angleX, angleY, angleZ, constants.vidWidth, constants.vidHeight)
    // logRef.current.innerText = isVisible
    curCamera.position.set( filteredCalkedCameraPosition[0].curVal, filteredCalkedCameraPosition[1].curVal, filteredCalkedCameraPosition[2].curVal )
    curCamera.rotation.set( angleX, angleY, angleZ, 'ZXY')

    // curCamera.aspect = 480.0/640.0 
    curCamera.fov = 90
    curCamera.aspect = 720 / 1280 // near far
    curCamera.near = 0.1
    curCamera.far = 1000
  }

  if (curScene.background === null){
    curScene.background = backgroundWebCamTexture
  }
}

function CameraController(props){
  useFrame((state, delta) => (cameraUpdate(state.camera, state.scene, delta)))  
}

const MainCanvas = ({mainCanvasRef}) => {
  return (
    <Canvas ref={mainCanvasRef} >
        {/* <perspectiveCamera fov={90}></perspectiveCamera> */}
      <CameraController></CameraController>
      <BeemHologram />
      {needAxis && <axesHelper args={[5]} />}
      {/* <axesHelper args={[5]} /> */}
    </Canvas>
  )
}

const BeemHologram = (props) => {
  const hologrameRef = useRef();
  hologrameTexture = new VideoTexture(hologramRef.current);
  // hologrameTexture = useVideoTexture("assets/model.mp4")

  useFrame(({ clock }) => {
    // hologrameRef.current.material.uniforms.uTexture.value = texture;
    hologrameRef.current.material.uniforms.uTexture.value = hologrameTexture
    if (webcamRef.current !== null ){
      if (backgroundWebCamTexture === null){
        backgroundWebCamTexture = new VideoTexture(webcamRef.current);
        backgroundWebCamTexture.encoding = THREE.sRGBEncoding

        hologrameRef.current.position.set(0, 0, 1.5)
        // let planeAngleX = Math.PI / 2 - (Math.PI / 2  - angleX) / 2
        let planeAngleX = Math.PI / 2
        hologrameRef.current.rotation.set(  planeAngleX , 0, angleZ, 'ZXY')
      }
    } 
  });

  return (
    <mesh ref={hologrameRef} {...props}>
      <planeGeometry args={[3, 6]}  />
      <shaderMaterial attach="material" args={[BeemShaderMaterial]} />
    </mesh>
  );
};



// function drawIm(){
//   canvasRef.current.width = 1280
//   canvasRef.current.height = 720
//   let ctx= canvasRef.current.getContext('2d');
//   let imageObj1 = new Image();
//   //  "assets/debagIm.jpeg"
//   imageObj1.src = 'assets/debagIm.jpeg'
//   ctx.drawImage(imageObj1,0,0);
//   requestAnimationFrame(drawIm)
// }

// function getBuffer(){
//   const constants = constraintsSinglton.getConstantsDict()
//   let ctx= canvasRef.current.getContext('2d');
// 	var curBoundsInVideo = vs.getBoundsJs(squarePoints, constants.boundsWidth, constants.boundsHeight, constants.vidWidth, constants.vidHeight, 1)
// 	var imData = ctx.getImageData(curBoundsInVideo.minX, curBoundsInVideo.minY, curBoundsInVideo.width, curBoundsInVideo.height).data 
// 	return imData.buffer
// }

  // function handleMotion(param){
  //   logRef.current.innerText = "handleMotion"
  // }
  // function onClickMotion() {
  //   console.log("onClick")
  //   logRef.current.innerText = "onClick"
  //   if (typeof DeviceMotionEvent.requestPermission === 'function') {
  //     logRef.current.innerText = "onClick1"
  //     // Handle iOS 13+ devices.
  //     DeviceMotionEvent.requestPermission()
  //       .then((state) => {
  //         logRef.current.innerText = state
  //         if (state === 'granted') {
  //           window.addEventListener('devicemotion', handleMotion);
  //         } else {
  //           console.error('Request to access the orientation was rejected');
  //         }
  //       })
  //       .catch(console.error);
  //   } else {
  //     logRef.current.innerText = "onClick2"
  //     // Handle regular non iOS 13+ devices.
  //     window.addEventListener('devicemotion', handleMotion);
  //   }
  // }