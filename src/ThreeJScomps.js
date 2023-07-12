import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { useAspect, useVideoTexture, useTexture } from '@react-three/drei'

export default function App() {
  return (
    <Canvas orthographic>
      <Scene />
    </Canvas>
  )
}

function Scene() {
  const size = useAspect(1800, 1000)
  return (
    <mesh scale={size}>
      <planeGeometry />
      <Suspense fallback={<FallbackMaterial url="10.jpg" />}>
        <VideoMaterial url="10.mp4" />
      </Suspense>
    </mesh>
  )
}

function VideoMaterial({ url }) {
  const texture = useVideoTexture(url)
  return <meshBasicMaterial map={texture} toneMapped={false} />
}

function FallbackMaterial({ url }) {
  const texture = useTexture(url)
  return <meshBasicMaterial map={texture} toneMapped={false} />
}



// import { Canvas, useFrame, WebGLRenderer, Mesh, Scene, extend, useLoader} from '@react-three/fiber'
// import { shaderMaterial } from '@react-three/drei';
// import React, { useRef, useState, useEffect, useMemo, createRef } from 'react'
// import * as THREE from 'three'



// var canvasTexture = null
// function sceneUpdate(curState, curDelta){
//     curState.scene.background = canvasTexture
//     // curState.scene.background = gVidTexture
// }
// function SceneController(props){
//     useFrame((state, delta) => (sceneUpdate(state, delta)))  
// }

// function cameraUpdate(curCamera, curDelta){
//   curCamera.rotation.z += curDelta
// }

// function CameraController(props){
//   useFrame((state, delta) => (cameraUpdate(state.camera, delta)))  
// }

// function getVidTexture() {
//   console.log("getVidTexture")

//     const [video] = useState(() => {
//         const vid = document.createElement("video");
//         vid.id = "three_id"
//         vid.src = "assets/model.mp4";
//         vid.crossOrigin = "Anonymous";
//         vid.loop = true;
//         vid.muted = true;
//         // vid.currentTime = 10
//         vid.play();
//         return vid;
//       });
//       var videoTexture = <videoTexture  attach="map"
//       minFilter={THREE.LinearFilter}
//       magFilter={THREE.LinearFilter}
//       format={THREE.RGBAFormat} 
//       args={[video]} />
//       return videoTexture
//  }

// function VideoPlane(props) {
//   const mesh = useRef(null)
//   const vidTexture = getVidTexture()
//   // gVidTexture = vidTexture
//   return (
//       <mesh
//         {...props}
//         ref={mesh}
//         scale={1}>
//         <planeGeometry args={[3, 6, 1]} />
//         <meshStandardMaterial >
//         {vidTexture}
//         </meshStandardMaterial>
//       </mesh>
//     )
// }
// // const vidTexture = getVidTexture()
// var gVidTexture = null

// export const DrawCanvas = props => {
//     console.log("DrawCanvas")
//     const canvasRef = useRef(null)
//     const testRef = useRef(null)
//     const canvaThreeJSsRef = useRef(null)
//     // const canvas = canvasRef.current
//     // const vidTexture = getVidTexture()
    
//     const draw = (ctx) => {
//         ctx.fillStyle = "grey";
//         ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
//         ctx.fillStyle = "black";
//         ctx.fillRect(25, 25, 100, 100);
//         ctx.clearRect(45, 45, 60, 60);
//         ctx.strokeRect(50, 50, 50, 50);
        
//     }

    
    
  
//     useEffect(() => {
      
//         const ctx = canvasRef.current.getContext("2d");
//         draw(ctx)
//         // console.log(vidTexture)
//         canvasTexture = new THREE.CanvasTexture(canvasRef.current);
//         // canvasTexture = texture
//         // canvasTexture.needsUpdate = true;
//         // testRef.current.map = canvasTexture;
//         // canvasTexture = getVidTexture()

//         // const [video] = useState(() => {
//         //   const vid = document.createElement("video");
//         //   vid.id = "three_id"
//         //   vid.src = "assets/model.mp4";
//         //   vid.crossOrigin = "Anonymous";
//         //   vid.loop = true;
//         //   vid.muted = true;
//         //   // vid.currentTime = 10
//         //   vid.play();
//         //   return vid;
//         // });
    
       
//       });


//     return  <div >
//         <canvas ref={canvasRef} {...props}/>
//         <Canvas ref={canvaThreeJSsRef} style={{ background: "hotpink" }}  >
//             <SceneController />
//             <VideoPlane></VideoPlane>
//         </Canvas>
//     </div>
//   }

//   // <mesh >
//   // <planeGeometry args={[4, 4]} />
//   // <meshBasicMaterial ref={testRef} attach="map" map={canvasTexture} />
//   // </mesh>



//     // const uniforms = useMemo(
//     //     () => ({
//     //         rawTexture: { 
//     //             type: "t",
//     //             value: 0, 
//     //             texture: canvasTexture 
//     //         },
//     //         test: { value: 0.5 }
//     //     }),
//     //     []
//     // );
//     // transparent: true, color="black" 
    
// // export const DrawCanvas2 = props => {
  
// //     const canvasRef = useRef(null)
// //     const canvaThreeJSsRef = useRef(null)
// //     // const canvas = canvasRef.current
    
// //     const draw = (ctx) => {
// //         ctx.fillStyle = "grey";
// //         ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
// //         ctx.fillStyle = "black";
// //         ctx.fillRect(25, 25, 100, 100);
// //         ctx.clearRect(45, 45, 60, 60);
// //         ctx.strokeRect(50, 50, 50, 50);
// //     }
// //     useEffect(() => {
// //         const ctx = canvasRef.current.getContext("2d");
// //         var texture = new THREE.CanvasTexture(canvasRef.current);
// //         canvasTexture = texture
// //         if (canvasTexture == null){
// //             console.log("canvasTexture2 null")
// //         } else {
// //             console.log("canvasTexture2 not null")
// //         }
// //         draw(ctx)
// //       });
// //     return  <div >
// //         <canvas ref={canvasRef} {...props}/>
// //         <Canvas ref={canvaThreeJSsRef} style={{ background: "hotpink" }}  >
// //             <SceneController />
// //             <mesh >
          
// //             <planeGeometry args={[2, 2]} />
// //             {/* <meshBasicMaterial attach="material" color = "black"> */}
            
// //             {/* </meshBasicMaterial> */}
// //             </mesh>
// //             {/* <Box position={[0, 0, 0]} /> */}
// //         </Canvas>
// //     </div>
// //   }

// // export default {backgrounCamCamvas, Box, DrawCanvas}

//  export  function backgrounCamCamvas(lvideo) {
//   const canvas = useRef(null)
//   const handleClick = function(){
//       console.log("click", canvas.current)
//   }
//   // const vidTexture = VidTexture()
//   // useFrame((state, delta) => (state.camera.rotation.z += delta
//   //     ))
  
//   return (
//       <Canvas ref={canvas} onClick={handleClick}>
//           <ambientLight />
//           <pointLight position={[10, 10, 10]} />
//           <CameraController />
//           {/* <SceneBackground /> */}
//           <VideoPlane position={[-1.2, 0, 0]} />
//           <Box position={[1.2, 0, 0]} />
//       </Canvas>
//     )
// }

// // var globalVidTexture = null

// export function Box(props) {
    
//     const mesh = useRef(null)
//     const [hovered, setHover] = useState(false)
//     const [active, setActive] = useState(false)
//     return (
//       <mesh
//         {...props}
//         ref={mesh}
//         scale={active ? 1.5 : 1}
//         onClick={(event) => setActive(!active)}
//         onPointerOver={(event) => setHover(true)}
//         onPointerOut={(event) => setHover(false)}>
//         <boxGeometry args={[1, 1, 1]} />
//         <meshStandardMaterial color={hovered ? 'hotpink' : 'orange'} />
//       </mesh>
//     )
// }



// // function setBG(state){
// //   state.scene.background = globalVidTexture
// // }

// // function SceneBackground(props){
// //   useFrame((state, delta) => (setBG(state)))
// // }


// // function CanvasPlane(props) {
// //     const mesh = useRef(null)
// //     return (
// //         <mesh
// //           {...props}
// //           ref={mesh}
// //           scale={1}>
// //           <planeGeometry args={[3, 3, 1]} />
// //           <meshStandardMaterial >
// //           {vidTexture}
// //           </meshStandardMaterial>
// //         </mesh>
// //       )
// // }


// const uniform = {
//   rawTexture: new THREE.Texture(),
// }

// const vertexVar = `
// varying vec2 vUv;
// void main(void){
//   vUv = uv;
//   vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
//   gl_Position = projectionMatrix * mvPosition;
// }
// `

// const fragmentVarOriginal = `
//   uniform sampler2D rawTexture;
//   uniform float test;
//   varying vec2 vUv;
//   void main(void)
//   {
//       vec4 t = texture2D(rawTexture, vUv);
//       gl_FragColor = vec4(0,t.g,0,1);
//       // gl_FragColor = vec4(t);
//   }
// `

// const PlaneShaderMaterial = shaderMaterial(
//   // Uniform
//   uniform,
//   // vertex shader
//   vertexVar,
//   // fragment shader
//   fragmentVarOriginal,
// );

// extend({ PlaneShaderMaterial });


// // const Wave = () => {
// //     const ref = useRef();

//     // const [video] = useState(() => {
//     //     const vid = document.createElement("video");
//     //     vid.id = "three_id"
//     //     vid.src = "assets/model.mp4";
//     //     vid.crossOrigin = "Anonymous";
//     //     vid.loop = true;
//     //     vid.muted = true;
//     //     // vid.currentTime = 10
//     //     vid.play();
//     //     return vid;
//     //   });

// //     // useFrame(({ clock }) s=> (ref.current.uTime = clock.getElapsedTime()));
// //     const [image] = useLoader(THREE.TextureLoader, [
// //         "https://images.unsplash.com/photo-1604011092346-0b4346ed714e?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1534&q=80"
// //           ]);
  
// //     return (
// //       <mesh>
// //         <planeBufferGeometry args={[0.4, 0.6, 16, 16]} />
// //         <planeShaderMaterial  ref={ref} rawTexture={image} />
// //       </mesh>
// //     );
// //   };
