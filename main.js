import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.149.0/build/three.module.js";
import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.149.0/examples/jsm/loaders/GLTFLoader.js";
import { Hands } from "https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js";
import { Camera } from "https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js";

const video = document.getElementById("video");

navigator.mediaDevices.getUserMedia({
  video:{facingMode:{ideal:"environment"}}
}).then(s=>video.srcObject=s);

const scene=new THREE.Scene();
const camera=new THREE.PerspectiveCamera(70,innerWidth/innerHeight,.01,100);
camera.position.z=2;

const renderer=new THREE.WebGLRenderer({alpha:true});
renderer.setSize(innerWidth,innerHeight);
document.body.appendChild(renderer.domElement);

scene.add(new THREE.HemisphereLight(0xffffff,0x444444,1));

let bouquet;
new GLTFLoader().load(
 "bouquet.glb",
 g=>{
  console.log("BOUQUET LOADED");
  bouquet=g.scene;
  bouquet.scale.set(1,1,1);
  bouquet.position.set(0,0,-1);
  scene.add(bouquet);
 },
 undefined,
 e=>{
  console.error("GLB ERROR",e);
 }
);


const hands=new Hands({locateFile:f=>`https://cdn.jsdelivr.net/npm/@mediapipe/hands/${f}`});
hands.setOptions({maxNumHands:1,minDetectionConfidence:.7,minTrackingConfidence:.7});

hands.onResults(r=>{
 if(r.multiHandLandmarks&&bouquet){
   const p=r.multiHandLandmarks[0][9];
   bouquet.position.set((p.x-.5)*2,-(p.y-.5)*2,-.5);
 }
});

new Camera(video,{
 onFrame:async()=>hands.send({image:video}),
 width:640,height:480
}).start();

(function anim(){
 requestAnimationFrame(anim);
 renderer.render(scene,camera);
})();

