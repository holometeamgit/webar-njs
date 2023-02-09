import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import React, { useState, useEffect, createRef } from 'react';
import {tap} from '../applogic/main'
import Renderer from '../components/Renderer'
import Video from '../components/Video'
import Canvas from '../components/Canvas'

import {
  vidWidth, 
  vidHeight,
	accelerometerIsGranted,
	angleX,
	angleY,
	angleZ} from '../applogic/constrains'

import {initAccelerometer} from '../applogic/main'

export default function Home() {

  const [showTapButton, setShowTapButton] = useState(true)
  const [isInteractable, setIsInteractable] = useState(false)

  useEffect(()=>{
    const {success, lIsInteractable} = initAccelerometer()
    if(!showTapButton)
      setShowTapButton(success)
      setIsInteractable(lIsInteractable)
  }, [])

  const videoRef = createRef();
  useEffect(() => {
    const timer = setTimeout(() => {
      console.log('This will run after 1 second!')
      runInBackground(videoRef, hiddenCanvasCtx, bufferCanvasCtx)
    }, 1000);
    return () => clearTimeout(timer);
  }, [videoRef, hiddenCanvasCtx, bufferCanvasCtx]);

  const video_files = ['video.mp4', 'vidoe.ogg']

  let hiddenCanvasCtx = undefined
  let bufferCanvasCtx = undefined
  let drawCanvasCtx = undefined

  return (
    <div>
    <Renderer />
    <Video video_file_name__mp4={video_files[0]} video_file_name__ogg={video_files[1]} videoRef={videoRef}/>
    <Canvas id='hiddenCanvas' is_hidden={true} context={hiddenCanvasCtx} width={vidWidth} heigh={vidHeight}/>
    <Canvas id='bufferCanvas'is_hidden={true} context={bufferCanvasCtx}  width={vidWidth} heigh={vidHeight}/>
    <Canvas id='drawCanvas' is_hidden={true} context={drawCanvasCtx}  width={vidWidth} heigh={vidHeight}/>
    </div>
  )

//   function createContext(width, height) {
//     var canvas = document.createElement('canvas');
//     canvas.width = width;
//     canvas.height = height;
//     return canvas.getContext("2d");
// }

  function runInBackground(video:any, hiddenCanvasCtx, bufferCanvasCtx){

    var preVisionTimeS = Date.now()
    // draw in hidden canvas, ThreeJS gets image of camera from it in three_js_scene.js
    bufferCanvasCtx.drawImage(video, 0, 0)
  
    // if user have no already tap on screen and put axies we only update on hiddenCanvasCtx frame from camera
    if (squarePoints == null){
      hiddenCanvasCtx.drawImage(video, 0, 0)
      setTimeout(runInBackground, cameraFrameTimeout);
      return
    }
  
    isRestart = updateTrackingStateAndCheckRestart()
    // if start of axis is not in camera frame we only update on hiddenCanvasCtx frame from camera withou update camera position
    if (isTracking == false){
      hiddenCanvasCtx.drawImage(video, 0, 0)
      log1.innerText = "tracking " + isTracking + " " + calkedCameraPosition[0].toFixed(1)+ " " + calkedCameraPosition[1].toFixed(1)+ " " + calkedCameraPosition[2].toFixed(1)
      setTimeout(runInBackground, cameraFrameTimeout);
      return
    }
  
    if (isRestart){
      squarePoints = pj.getStartPointsWithCameraPosition(calkedCameraPosition, angleX, angleY, angleZ)
    }
  
    let curBounds = vs.getBoundsJs(squarePoints, boundsWidth, boundsHeight, vidWidth, vidHeight, 1)
    buffer = getBuffer()
  
    preVisionTime = (Date.now() - preVisionTimeS)
    startWorker = Date.now()
  
    // send image data buffer to visionWorker to find update of camera position
    visionWorker.postMessage({cmd: 'process', buf: buffer, curBounds : curBounds, scale : 2, isRestart : isRestart,
       points : squarePoints, angles : [angleX, angleY, angleZ] } , [buffer]); 
    
  }


  const onScreenTapHandler = (event) => {
    console.log(event.detail);
    switch (event.detail) {
      case 1: {
        console.log('single click');
        if ( (isInteractable) && (workerReady)  && (accelerometerIsGranted) ){ //&& (mainOpenCvIsReady)

          var x = event.touches[0].clientX;
          var y = event.touches[0].clientY;
          
          var u = x / drawCanvas.width * vidWidth
          var v = y / drawCanvas.height * vidHeight
  
          let cameraP = pj.getCameraPositionWithZ(angleX, angleY, -angleZ, [u, v], [0, 0, 0], 4)
          calkedCameraPosition = cameraP.cameraPos
  
          
          initTracking(x, y)
  
          setIsInteractable(false)
        }
        break;
      }
      case 2: {
        console.log('double click');
        if ( (isInteractable) && (workerReady)  && (accelerometerIsGranted) ){
          var x1 = event.touches[0].clientX;
          var y1 = event.touches[0].clientY;
          var x2 = event.touches[1].clientX; 
          var y2 = event.touches[1].clientY;
          startDist2Touches = ( x1 - x2 ) * ( x1 - x2 ) + ( y1 - y2 ) * ( y1 - y2 )
        }
        break;
      }
    }
  }
}
