const video = document.getElementById("video");

// THREE setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(70, window.innerWidth/window.innerHeight, 0.01, 100);
camera.position.z = 2;

const renderer = new THREE.WebGLRenderer({alpha:true});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const light = new THREE.HemisphereLight(0xffffff,0x444444,1);
scene.add(light);

// Load bouquet
let bouquet;
const loader = new THREE.GLTFLoader();
loader.load("bouquet.glb", gltf => {
  bouquet = gltf.scene;
  bouquet.scale.set(0.3,0.3,0.3);
  scene.add(bouquet);
});

// MediaPipe Hands
const hands = new Hands({
  locateFile: file => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
});

hands.setOptions({
  maxNumHands: 1,
  minDetectionConfidence: 0.7,
  minTrackingConfidence: 0.7
});

hands.onResults(results => {
  if(results.multiHandLandmarks && bouquet){
    const palm = results.multiHandLandmarks[0][9];

    bouquet.position.x = (palm.x - 0.5) * 2;
    bouquet.position.y = -(palm.y - 0.5) * 2;
    bouquet.position.z = -0.5;
  }
});

const cam = new Camera(video, {
  onFrame: async () => {
    await hands.send({image: video});
  },
  width: 640,
  height: 480
});

cam.start();

function animate(){
  requestAnimationFrame(animate);
  renderer.render(scene,camera);
}

animate();
