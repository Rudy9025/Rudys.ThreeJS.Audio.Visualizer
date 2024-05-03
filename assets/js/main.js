// IMPORTS
import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.121.1/examples/jsm/controls/OrbitControls.js";

// UTILITIES
let audioCtx;
let analyser;
let audioSrc;
let songNum = 0;

// UNIFORMS
const planeUniforms = {
  iTime: { value: 0 },
  iResolution: { value: new THREE.Vector3() },
};

// SHADERS
const planeVertexShader = /*glsl*/ `
#include <common>
attribute float aFrequency;
varying float vFrequency;
varying vec4 vPosition;
void main()
{
    
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    modelPosition.y += (aFrequency - 150.0) * 0.15 - 0.5;
    
    vPosition = modelPosition;
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;

    gl_Position = projectedPosition;

    vFrequency = aFrequency;
}`;

const planeFragmentShader = /* glsl */ `
#include <common>
uniform vec3 iResolution;
uniform float iTime;
varying vec4 vPosition;
// By iq: https://www.shadertoy.com/user/iq  
// license: Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License.
void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    // Normalized pixel coordinates (from 0 to 1)
    vec2 uv = fragCoord/iResolution.xy;
 
    // Time varying pixel color
    vec3 col = 0.5 + 0.5*cos(iTime+uv.xyx+vec3(0,2,4));

    col.rgb -=  abs(7.0 - vPosition.y - 2.0)/25.0;
    // Output to screen
    fragColor = vec4(col,1.0);
}
 
void main() {
  mainImage(gl_FragColor, gl_FragCoord.xy);
}`;

const shapeVertexShader = /* glsl */ `
#include <common>

uniform vec3 iResolution;
uniform float iTime;
attribute float aFrequency;
varying vec4 vPosition;
void main()
{
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    if(aFrequency > 100.0){
        modelPosition.y *= aFrequency * 0.01;
    }
    
    vPosition = modelPosition;
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;

    gl_Position = projectedPosition;
}`;

const shapeFragmentShader = /* glsl */ `
#include <common>
uniform vec3 iResolution;
uniform float iTime;
varying vec4 vPosition;
// By iq: https://www.shadertoy.com/user/iq  
// license: Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License.
void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    // Normalized pixel coordinates (from 0 to 1)
    vec2 uv = fragCoord/iResolution.xy;
 
    // Time varying pixel color
    vec3 col = 0.5 + 0.5*cos(iTime+uv.xyx+vec3(0,2,4));

    col.rgb -=  abs(7.0 - vPosition.y - 2.0)/25.0;
    // Output to screen
    fragColor = vec4(col,1.0);
}
 
void main() {
  mainImage(gl_FragColor, gl_FragCoord.xy);
}`;

// DOM  

// HANDLE DOM OVERLAY 
document.querySelector(".toggle").classList.add("hide");
document.querySelector(".overlay").addEventListener("click", () => {
  // console.log(audioCtx);
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();

  audioSrc = audioCtx.createMediaElementSource(
    document.getElementById("test-song")
  );
  analyser = audioCtx.createAnalyser();

  document.querySelector(".overlay").classList.add("hide");
  document.querySelector(".toggle").classList.remove("hide");
   document.getElementById("test-song").play();
   analyser.getByteFrequencyData(frequencyData);
  console.log(audioCtx);
  audioSrc.connect(analyser);
  audioSrc.connect(audioCtx.destination);
  document.getElementById("change-btn").classList.remove("hide");
  document.getElementById("choose-music").classList.remove("hide");
  document.getElementById("test-song").classList.remove("hide");
  const fullscreenToggle = document.querySelector(".overlay")
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch((error) => {
       console.error('Error attempting to enable full-screen mode:', error);
   });
    fullscreenToggle.textContent = 'fullscreen_exit';
} else {
    document.exitFullscreen();
    fullscreenToggle.textContent = 'fullscreen';
}
});

const frequencyData = new Uint8Array(1024);

// HANDLING CHANGE SONG DOM  
document.getElementById("change-btn").addEventListener("click", () => {
  document.getElementById("test-song").src = `./Music/test-song${
    (songNum++ % 7) + 1
  }.mp3`;
  console.log();

  document.getElementById("test-song").play();
});

// SIZES 
const sizes = { height: window.innerHeight, width: window.innerWidth };
const canvas = document.querySelector(".webgl");
// RENDERER 
const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(sizes.width, sizes.height);
// RESIZE 
window.addEventListener("resize", () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();
  renderer.setSize(sizes.width, sizes.height);

  renderer.render(scene, camera);
});
// SCENE 
const scene = new THREE.Scene();
// PLANE 
const planeGeometry = new THREE.PlaneBufferGeometry(400, 400, 20, 20);
const planeVertexCount = planeGeometry.attributes.position.count;

const planeMaterial = new THREE.ShaderMaterial({
  vertexShader: planeVertexShader,
  uniforms: planeUniforms,
  fragmentShader: planeFragmentShader,
  transparent: true,
  side: THREE.DoubleSide,
  wireframe: false,
  // fog: true,
  transparent: true,
  // flatshading: true
});

const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.x = -Math.PI / 2;
plane.position.y = -7;
scene.add(plane);

// OUTER SHAPE 
const outerShapeGeometry = new THREE.IcosahedronGeometry(5, 1);
const outerShapeMaterial = new THREE.ShaderMaterial({
  uniforms: planeUniforms,
  vertexShader: shapeVertexShader,
  fragmentShader: shapeFragmentShader,
  transparent: true,
  side: THREE.DoubleSide,
  wireframe: true,
  // fog: true,
  transparent: true,

  // flatshading: true
});

const outerShape = new THREE.Mesh(outerShapeGeometry, outerShapeMaterial);
outerShape.position.y = 5;
scene.add(outerShape);

// INNER SHAPE 
const innerShapeGeometry = new THREE.IcosahedronGeometry(3, 2);
const innerShapeMaterial = new THREE.ShaderMaterial({
  vertexShader: shapeVertexShader,
  fragmentShader: shapeFragmentShader,
  transparent: true,
  side: THREE.DoubleSide,
  wireframe: false,
  // fog: true,
  transparent: true,
  // flatshading: true
});

const innerShape = new THREE.Mesh(innerShapeGeometry, innerShapeMaterial);
innerShape.position.y = 5;
scene.add(innerShape);

// CAMERA 
const camera = new THREE.PerspectiveCamera(
  55,
  sizes.width / sizes.height,
  0.1,
  500
);
camera.position.z = 55;
camera.position.x = 0;
camera.position.y = 6;

// LIGHTS 
const directionalLight = new THREE.DirectionalLight(0xff0000, 0.5);
directionalLight.position.x = -20;
directionalLight.position.z = 10;
scene.add(directionalLight);

const ambientLight = new THREE.AmbientLight(0xfffd00, 0.3);
scene.add(ambientLight);

renderer.render(scene, camera);

// CONTROLS 
const controls = new OrbitControls(camera, renderer.domElement);

// TESTING FOG 
let fogColor = new THREE.Color("black");
scene.background = fogColor;
scene.fog = new THREE.Fog(fogColor, 0.25, 10);

// ANIMATION 
let clock = new THREE.Clock();
function animate(time) {
  time *= 0.001;
  const canvas = renderer.domElement;

  planeUniforms.iResolution.value.set(canvas.width, canvas.height, 1);
  planeUniforms.iTime.value = time;
  if (analyser) {
    console.log(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(frequencyData);
  }

  planeGeometry.setAttribute(
    "aFrequency",
    new THREE.BufferAttribute(frequencyData, 1)
  );

  outerShapeGeometry.setAttribute(
    "aFrequency",
    new THREE.BufferAttribute(frequencyData, 1)
  );

  innerShapeGeometry.setAttribute(
    "aFrequency",
    new THREE.BufferAttribute(frequencyData, 1)
  );

  plane.geometry.verticesNeedsUpdates = true;
  plane.geometry.normalNeedsUpdates = true;
  plane.geometry.computeVertexNormals();
  plane.geometry.computeVertexNormals();

  outerShape.geometry.verticesNeedsUpdates = true;
  outerShape.geometry.normalNeedsUpdates = true;
  outerShape.geometry.computeVertexNormals();
  outerShape.geometry.computeVertexNormals();

  innerShape.geometry.verticesNeedsUpdates = true;
  innerShape.geometry.normalNeedsUpdates = true;
  innerShape.geometry.computeVertexNormals();
  innerShape.geometry.computeVertexNormals();
  outerShape.rotation.y = clock.getElapsedTime() * 1.5;

  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

animate();

