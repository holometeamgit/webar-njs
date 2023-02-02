import {calkedCameraPosition, 
    filteredCalkedCameraPosition,
    angleX,
	angleY,
	angleZ
} from './constrains'

var hologramHeight = 4

var scene = new THREE.Scene();

var light = new THREE.PointLight(0xEEEEEE);
light.position.set(20, 0, 20);
scene.add(light);

var lightAmb = new THREE.AmbientLight(0x777777);
scene.add(lightAmb);


var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.domElement.id = "renderer"
document.body.appendChild(renderer.domElement);
renderer.domElement.style.left = 0
renderer.domElement.style.top = 0
renderer.domElement.style.position = "absolute"

// here

renderer.domElement.style.zIndex = "-10";

var cubeColor = 0x000000;
var geometry = new THREE.BoxGeometry(2, 2, 0.01);
var material = new THREE.MeshLambertMaterial({
    color: 0xff00ff,
    ambient: 0x121212,
    emissive: 0x121212
});
var cube = new THREE.Mesh(geometry, material);
// cube.rotation.x = -Math.PI / 2
cube.position.x = 0
cube.position.y = 0
cube.position.z = 0

var camera = new THREE.PerspectiveCamera(90, 720 / 1280, 0.1, 1000);

var axesHelper = new THREE.AxesHelper( 2 );
scene.add( axesHelper );

var planeMaterial = new THREE.MeshLambertMaterial({
    color: 0xff00ff,
    ambient: 0x121212,
    emissive: 0x121212
});

var testPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(2, 4),
    planeMaterial,
);

testPlane.position.set( 0, 0, 2 ); 
// scene.add(testPlane);

var webcamTexture = new THREE.VideoTexture(video);
webcamTexture.needsUpdate;
webcamTexture.minFilter = THREE.LinearFilter;
webcamTexture.magFilter = THREE.LinearFilter;
webcamTexture.format = THREE.RGBFormat;
webcamTexture.crossOrigin = 'anonymous';

const hiddenCanvasTexture = new THREE.CanvasTexture(hiddenCanvas); //hiddenCanvasCtx
hiddenCanvasTexture.minFilter = THREE.LinearFilter;
hiddenCanvasTexture.needsUpdate;

var backgroundMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(2, 2, 0),
    new THREE.MeshBasicMaterial({
    map:  hiddenCanvasTexture // hiddenCanvasTexture webcamTexture
    })
);

backgroundMesh .material.depthTest = false;
backgroundMesh .material.depthWrite = false;

// Create your background scene
var backgroundScene = new THREE.Scene();
var backgroundCamera = new THREE.Camera();

backgroundScene .add(backgroundCamera );
backgroundScene .add(backgroundMesh );


// var videoToShow = document.getElementById('hologram');
// var texture = new THREE.VideoTexture(videoToShow);
// texture.needsUpdate;
// texture.minFilter = THREE.LinearFilter;
// texture.magFilter = THREE.LinearFilter;
// texture.format = THREE.RGBAFormat;

// videoToShow.src = "assets/model.mp4";
// videoToShow.load();
// videoToShow.pause()

// shaderMaterial = new THREE.ShaderMaterial({
//       uniforms: {
//                     texture: {
//                         type: "t",
//                         value: texture
//                     }
//                 },
//       transparent: true,
//       vertexShader: ["varying vec2 vUv;", 
//       "void main(void)", 
//       "{", 
//       "vUv = uv;", 
//       "vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );", 
//       "gl_Position = projectionMatrix * mvPosition;", "}"].join("\n"),
//       fragmentShader: [
//             "uniform sampler2D texture;",
//             "// uniform vec3 color;",
//             "varying vec2 vUv;",
//             "void main(void)",
//             "{",
//             "    vec3 tColor = texture2D( texture, vec2(vUv.x * 0.5, vUv.y)).rgb;",
//             "    vec3 mask = texture2D( texture, vec2(vUv.x * 0.5 + 0.5, vUv.y)).rgb;",
//             "    // float a = (length(tColor - color) - 0.5) * 7.0;",
//             "    gl_FragColor = vec4(tColor.b * mask.g, tColor.g * mask.g, tColor.r * mask.g, mask.g);",
//             "}"].join("\n")
// });

// var plane = new THREE.Mesh(
//     new THREE.PlaneGeometry(2, hologramHeight),
//     shaderMaterial,
//     );

// plane.position.set( 0, 0, hologramHeight / 2 );

// scene.add(plane);




// ============================================================================

// Rendering function
var render = function () {
    // console.log("render")
    hiddenCanvasTexture.needsUpdate = true;
    requestAnimationFrame(render);
    // console.log("3js 2")
    // log1.innerText = "render nil"

    if (calkedCameraPosition != null){
        // console.log(calkedCameraPosition)

        camera.position.set( filteredCalkedCameraPosition[0].curVal, filteredCalkedCameraPosition[1].curVal, filteredCalkedCameraPosition[2].curVal ); 
        // camera.position.set( calkedCameraPosition[0], calkedCameraPosition[1], calkedCameraPosition[2] ); 
        camera.rotation.set( angleX, angleY, angleZ, 'ZXY')
        let planeAngleX = Math.PI / 2 - (Math.PI / 2  - angleX) / 2
        testPlane.rotation.set(  planeAngleX , 0, angleZ, 'ZXY')
        // plane.rotation.set(  planeAngleX , 0, angleZ, 'ZXY')

    }
    renderer.autoClear = false;
    renderer.clear();
    renderer.render( backgroundScene , backgroundCamera );
    renderer.render( scene, camera );
};

function addObjactsOnScene(){
    scene.add( cube );
    scene.add( plane );
}

function setSceneVisible(isVisible){
    console.log("setSceneVisible ", isVisible)
    scene.visible = isVisible;
}

function scaleHologram(scaleValue){
    plane.scale.set(plane.scale.x*scaleValue, plane.scale.y * scaleValue, plane.scale.z * scaleValue)
    plane.position.z = hologramHeight * plane.scale.z / 2
}

render();
