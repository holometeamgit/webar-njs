import React, { useRef, createRef, useEffect } from "react";
import { WebcamVideo } from './Video'
import { Canvas, useFrame } from '@react-three/fiber';
import { useVideoTexture } from "@react-three/drei";
// import css from "../styles/Home.module.css";
import * as THREE from 'three'
import { VideoTexture } from "three/src/Three";

const webcamRef = createRef();
const webcam = <WebcamVideo  vidRef={webcamRef}></WebcamVideo>

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
  curCamera.rotation.z += curDelta
  if (curScene.background === null){
    curScene.background = backgroundWebCamTexture
  }
}

function CameraController(props){
  useFrame((state, delta) => (cameraUpdate(state.camera, state.scene, delta)))  
}

const MainCanvas1 = (props) => {
  return (
    <Canvas >
        <CameraController></CameraController>
        <BeemHologram/>
      </Canvas>
  )
}

const BeemHologram = (props) => {
  const hologrameRef = useRef();
  const texture = useVideoTexture("assets/model.mp4")

  useFrame(({ clock }) => {
    hologrameRef.current.material.uniforms.uTexture.value = texture;
    if (webcamRef.current !== null ){
      if (backgroundWebCamTexture === null){
        backgroundWebCamTexture = new VideoTexture(webcamRef.current);
        backgroundWebCamTexture.encoding = THREE.sRGBEncoding
      }
    } 
  });

  return (
    <mesh ref={hologrameRef} {...props}>
      <planeGeometry args={[1, 2]}  />
      <shaderMaterial attach="material" args={[BeemShaderMaterial]} />
    </mesh>
  );
};

export default { MainCanvas1 }


// export const DrawCanvas = props => {
//   console.log("DrawCanvas")
//   const canvasRef = useRef(null)
//   const testRef = useRef(null)
//   const canvaThreeJSsRef = useRef(null)
//   // const canvas = canvasRef.current
//   // const vidTexture = getVidTexture()
  
//   const draw = (ctx) => {
//       ctx.fillStyle = "grey";
//       ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
//       ctx.fillStyle = "black";
//       ctx.fillRect(25, 25, 100, 100);
//       ctx.clearRect(45, 45, 60, 60);
//       ctx.strokeRect(50, 50, 50, 50);
      
//   }

// function VideoMaterial({ url }) {
//   const texture = useVideoTexture(url)
//   dVideoTexture = texture
//   return <meshBasicMaterial map={texture} toneMapped={false}  /> //opacity={0.0}
// }

// function Scene() {

//   return (
//     <mesh >
//       <planeGeometry args={[1, 2]} />
//       {/* <meshBasicMaterial opacity = {0.5} /> */}
//       {/* <meshBasicMaterial transparent /> */}
//       {/* color={0xff8300} attach="material"  */}
//       {/* <color attach="background" args={['#f5efe6']} /> */}
//       {/* <VideoMaterial url="assets/model.mp4" /> */}
//     </mesh>
//   )
// }



// ReactDOM.render(<App />, document.getElementById("root"));


// import { Suspense } from 'react'
// import { Canvas, useFrame, WebGLRenderer, Mesh, extend, useLoader} from '@react-three/fiber'
// import { useAspect, useVideoTexture, useTexture } from '@react-three/drei'
// console.log("test")
// var dVideoTexture = null
// function cameraUpdate(curCamera, curScene, curDelta){
//   curCamera.rotation.z += curDelta
//   curScene.background = dVideoTexture
// }

// function CameraController(props){
//   useFrame((state, delta) => (cameraUpdate(state.camera, state.scene, delta)))  
// }

// export default function App() {
//   return (
//     <Canvas orthographic>
//       <CameraController></CameraController>
//       <Scene />
//     </Canvas>
//   )
// }



// function VideoMaterial({ url }) {
//   const texture = useVideoTexture(url)
//   dVideoTexture = texture
//   return <meshBasicMaterial map={texture} toneMapped={false} />
// }

// function FallbackMaterial({ url }) {
//   const texture = useTexture(url)
//   return <meshBasicMaterial map={texture} toneMapped={false} />
// }

// to here =====




// import css from "../styles/Home.module.css";
// import { Canvas, useFrame, useThree } from "@react-three/fiber";
// import { WebcamVideo, HologramVideo } from '../Video'
// import React, { useState, useEffect, createRef, useRef } from 'react';
// import { backgrounCamCamvas, Box, DrawCanvas } from '../ThreeJScomps'

// const hologramRef = createRef();
// const hologram = <HologramVideo  vidRef={hologramRef}></HologramVideo>
// const webcamRef = createRef();
// const webcam = <WebcamVideo  vidRef={webcamRef}></WebcamVideo>

// export default function Home() {

//   const bg = backgrounCamCamvas(webcamRef)
//   const canvas = useRef(null)
  
//     const handleClick = function(){
//         console.log("Cool")
//     }

//     // const state = useThree()

//     // useFrame(state => {
//     //   console.log("state")
//     // })

//   return (
//     <div className={css.scene}>
//       {/* {hologram}
//       {webcam} */}
//       <DrawCanvas></DrawCanvas>
//       {/* {bg} */}
      
//       {/* <backgrounCamCamvas
//         className={css.canvasCamera}
//       >
//       </backgrounCamCamvas> */}
//       {/* <Canvas ref={canvas}  onClick={handleClick}
//         // shadows={true}
//         className={css.canvasMain}
//         // camera={{
//         //   position: [-6, 7, 7],
//         // }}
        
//       >
//         <Box position={[0, 0, 0]} />
        
//       </Canvas> */}
      
//       {/* <button className={css.buttonMain} onClick={handleClick}> Dima </button> */}
//     </div>
//   );
// }

// function buttonTap(){
//   console.log("Button tap")
// }