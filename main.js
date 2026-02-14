const video = document.getElementById("video");

navigator.mediaDevices.getUserMedia({
  video: { facingMode: { ideal: "environment" } }
}).then(stream=>{
  video.srcObject = stream;
});

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(70,window.innerWidth/window.innerHeight,0.01,100);
camera.position.z = 2;

const renderer = new THREE.WebGLRenderer({alpha:true});
renderer.setSize(window.innerWidth,window.innerHeight);
document.body.appendChild(renderer.domElement);

scene.add(new THREE.HemisphereLight(0xffffff,0x444444,1));

let bouquet;
new GLTFLoader().load("bouquet.glb", g=>{
  bouquet=g.scene;
  bouquet.scale.set(.3,.3,.3);
  scene.add(bouquet);
});

const hands=new Hands({locateFile:f=>`https://cdn.jsdelivr.net/npm/@mediapipe/hands/${f}`});
hands.setOptions({maxNumHands:1,minDetectionConfidence:.7,minTrackingConfidence:.7});

hands.onResults(r=>{
  if(r.multiHandLandmarks&&bouquet){
    const p=r.multiHandLandmarks[0][9];
    bouquet.position.set((p.x-.5)*2,-(p.y-.5)*2,-.5);
  }
});

new Camera(video,{
  onFrame:async()=>{await hands.send({image:video});},
  width:640,height:480
}).start();

(function anim(){
  requestAnimationFrame(anim);
  renderer.render(scene,camera);
})();
