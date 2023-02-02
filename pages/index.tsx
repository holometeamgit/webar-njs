import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import React, { useState, useEffect } from 'react';
import {tap} from '../applogic/main'

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

  return (
    <main className={styles.main} onClick={e=>onScreenTapHandler}>
      {/* <script defer src="assets/numeric-1.2.6.min.js" ></script>  */}
      {/* <script defer src="assets/three.min.js" ></script> */}

      {/* <script defer src="src/kalman_filter.js" ></script>
      <script defer src="src/constrains.js" ></script>
      <script defer src="src/projective.js" ></script>
      <script defer src="src/wasm.js" ></script>
      <script defer src="src/vision.js" ></script>
      <script defer src="src/drawing.js" ></script>
      <script defer src="src/collection.js" ></script>
      <script defer src="src/three_js_scene.js" ></script>
      <script defer src="src/main_flow.js" ></script> */}


      { showTapButton && <button id="tapButton" className={styles.button} type="submit" onClick={ (event) => { tap() } } > {"Init Sensors"} </button>}

      <div id="debag" className={styles.divs} > loading </div> 
      <div id="info1" className={styles.divs} >--</div>

    <video muted playsInline autoPlay id="webcam" className={styles.videos} width={vidWidth} height={vidHeight}> </video>
    <video playsInline autoPlay id="hologram" className={styles.videos}> </video>

    </main> 
  )

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
