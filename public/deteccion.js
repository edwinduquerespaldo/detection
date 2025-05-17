const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const statusDiv = document.getElementById('status');
const ctx = canvas.getContext('2d');
let model = null;

async function setupCamera() {
  const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  video.srcObject = stream;
  return new Promise((resolve) => {
    video.onloadedmetadata = () => {
      resolve();
    };
  });
}

async function loadScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

async function loadModel() {
  // Cargar TensorFlow.js y coco-ssd en orden
  await loadScript('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.18.0/dist/tf.min.js');
  await loadScript('https://cdn.jsdelivr.net/npm/@tensorflow-models/coco-ssd');
  model = await cocoSsd.load();
  statusDiv.textContent = 'Modelo cargado. Detectando objetos...';
}

async function detectFrame() {
  if (!model) return;
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  const predictions = await model.detect(canvas);
  drawPredictions(predictions);
  requestAnimationFrame(detectFrame);
}

function drawPredictions(predictions) {
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  predictions.forEach(pred => {
    ctx.strokeStyle = '#00FF00';
    ctx.lineWidth = 2;
    ctx.strokeRect(...pred.bbox);
    ctx.font = '16px Arial';
    ctx.fillStyle = '#00FF00';
    ctx.fillText(pred.class + ' (' + Math.round(pred.score * 100) + '%)', pred.bbox[0], pred.bbox[1] > 20 ? pred.bbox[1] - 5 : 10);
  });
}

async function main() {
  await setupCamera();
  video.width = video.videoWidth;
  video.height = video.videoHeight;
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  await loadModel();
  detectFrame();
}

main();
