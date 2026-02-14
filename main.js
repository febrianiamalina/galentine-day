import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.149.0/build/three.module.js";
import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.149.0/examples/jsm/loaders/GLTFLoader.js";
import { Hands } from "https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js";
import { Camera } from "https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js";

const video = document.getElementById("video");

// Open rear camera
navigator.mediaDevices.getUserMedia({
  video: { facingMode: { ideal: "environment" } }
}).then(stream => {
  video.srcObject = stream;
});

// THREE setup
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  70,
  window.innerWidth / window.innerHeight,
  0.01,
  100
);
camera.position.z = 2;

const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Light
scene.add(new THREE.AmbientLight(0xffffff, 2));

// Load bouquet
let bouquet;

new GLTFLoader().load(
  "bouquet.glb",
  g => {
    bouquet = g.scene;
    bouquet.scale.set(0.4, 0.4, 0.4);
    bouquet.rotation.x = Math.PI / 2;
    bouquet.position.set(0, 0, -1);
    scene.add(bouquet);
    console.log("BOUQUET LOADED");
  },
  undefined,
  e => console.error(e)
);

// MediaPipe Hands
const hands = new Hands({
  locateFile: f => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${f}`
});

hands.setOptions({
  maxNumHands: 1,
  minDetectionConfidence: 0.7,
  minTrackingConfidence: 0.7
});

// Move bouquet to palm
hands.onResults(results => {
  if (!bouquet) return;
  if (!results.multiHandLandmarks) return;

  const p = results.multiHandLandmarks[0][9];

  bouquet.position.x = (p.x - 0.5) * 3;
  bouquet.position.y = -(p.y - 0.5) * 3;
  bouquet.position.z = -0.3;
});

// Start camera tracking
const cam = new Camera(video, {
  onFrame: async () => {
    await hands.send({ image: video });
  },
  width: 640,
  height: 480
});

cam.start();

// Render loop
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

animate();
