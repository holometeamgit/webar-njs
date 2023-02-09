import {createRef} from 'react'
import {WebGLRenderer} from 'three'


const Renderer = () => {
    const canvasRef = createRef();
    const renderer = new WebGLRenderer({canvas: canvasRef});
    renderer.setSize(window.innerWidth, window.innerHeight);

    return <div style={{position:'absolute', left:0, 'top':0}} id='renderer' ref={this.canvasRef} />;
} 

export default Renderer