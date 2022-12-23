import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'

export default function Home() {
  return (
    <main className={styles.main}>
      <script defer src="assets/numeric-1.2.6.min.js" ></script> 
      <script defer src="assets/three.min.js" ></script>
      <script defer src="src/kalman_filter.js" ></script>
      <script defer src="src/constrains.js" ></script>
      <script defer src="src/projective.js" ></script>
      <script defer src="src/wasm.js" ></script>
      <script defer src="src/vision.js" ></script>
      <script defer src="src/drawing.js" ></script>
      <script defer src="src/collection.js" ></script>
      <script defer src="src/three_js_scene.js" ></script>
      <script defer src="src/main_flow.js" ></script>

      <script defer src="src/main.js" ></script>


      <button id="tapButton" className={styles.button} type="submit" onClick={ (event) => { tap() } } > {"Init Sensors"} </button>

      <div id="debag" className={styles.divs} > loading </div> 
      <div id="info1" className={styles.divs} >--</div>

    <video muted playsInline autoPlay id="webcam" className={styles.videos} width="720" height= "1280"> </video>
    <video playsInline autoPlay id="hologram" className={styles.videos}> </video>

    </main> 
  )
}
