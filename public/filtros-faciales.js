// Filtros faciales interactivos con FaceMesh y ml5.js
window.addEventListener('DOMContentLoaded', () => {
  const video = document.getElementById('filtros-video');
  const canvas = document.getElementById('filtros-canvas');
  const ctx = canvas.getContext('2d');
  const statusDiv = document.getElementById('filtros-status');
  const filtroSelect = document.getElementById('filtro-select');
  let facemesh = null;
  let filtro = filtroSelect.value;

  // Cargar imágenes de filtros
  const imgSombrero = new window.Image();
  imgSombrero.src = '/hat.webp'; // Usar imagen local de sombrero

  let imgSombreroLoaded = false;
  imgSombrero.onload = () => { imgSombreroLoaded = true; };

  filtroSelect.addEventListener('change', () => {
    filtro = filtroSelect.value;
  });

  async function setupCamera() {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;
    return new Promise((resolve) => {
      video.onloadedmetadata = () => resolve();
    });
  }

  function drawFiltro(prediction) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!prediction) return;
    const keypoints = prediction.annotations;
    if (!keypoints) return;
    // Escalado
    const vWidth = video.videoWidth;
    const vHeight = video.videoHeight;
    const cWidth = canvas.width;
    const cHeight = canvas.height;
    const scaleX = cWidth / vWidth;
    const scaleY = cHeight / vHeight;
    // Filtro: gafas (vectorial)
    if (filtro === 'gafas') {
      if (
        keypoints.leftEyeUpper0 && keypoints.leftEyeUpper0[0] &&
        keypoints.rightEyeUpper0 && keypoints.rightEyeUpper0[3]
      ) {
        // Ojo izquierdo y derecho
        const left = keypoints.leftEyeUpper0[0];
        const right = keypoints.rightEyeUpper0[3];
        const lx = left[0] * scaleX;
        const ly = left[1] * scaleY;
        const rx = right[0] * scaleX;
        const ry = right[1] * scaleY;
        const dx = rx - lx;
        const dy = ry - ly;
        const angle = Math.atan2(dy, dx);
        const dist = Math.sqrt(dx*dx + dy*dy);
        // Centro de cada ojo
        const cxL = lx;
        const cyL = ly;
        const cxR = rx;
        const cyR = ry;
        // Radio de los lentes
        const r = dist * 0.38;
        ctx.save();
        ctx.translate((cxL + cxR) / 2, (cyL + cyR) / 2);
        ctx.rotate(angle);
        ctx.translate(-(cxL + cxR) / 2, -(cyL + cyR) / 2);
        // Lente izquierdo
        ctx.beginPath();
        ctx.arc(cxL, cyL, r, 0, 2 * Math.PI);
        ctx.lineWidth = 5;
        ctx.strokeStyle = '#222';
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(cxL, cyL, r - 4, 0, 2 * Math.PI);
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#7be495';
        ctx.stroke();
        // Lente derecho
        ctx.beginPath();
        ctx.arc(cxR, cyR, r, 0, 2 * Math.PI);
        ctx.lineWidth = 5;
        ctx.strokeStyle = '#222';
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(cxR, cyR, r - 4, 0, 2 * Math.PI);
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#7be495';
        ctx.stroke();
        // Puente
        ctx.beginPath();
        ctx.moveTo(cxL + r * 0.7, cyL);
        ctx.lineTo(cxR - r * 0.7, cyR);
        ctx.lineWidth = 4;
        ctx.strokeStyle = '#222';
        ctx.stroke();
        ctx.restore();
      }
    }
    // Filtro: sombrero
    else if (filtro === 'sombrero' && imgSombreroLoaded) {
      if (
        keypoints.leftEyeUpper0 && keypoints.leftEyeUpper0[0] &&
        keypoints.rightEyeUpper0 && keypoints.rightEyeUpper0[3]
      ) {
        const left = keypoints.leftEyeUpper0[0];
        const right = keypoints.rightEyeUpper0[3];
        const lx = left[0] * scaleX;
        const ly = left[1] * scaleY;
        const rx = right[0] * scaleX;
        const ry = right[1] * scaleY;
        const dx = rx - lx;
        const dy = ry - ly;
        const angle = Math.atan2(dy, dx);
        const width = Math.sqrt(dx*dx + dy*dy) * 2.5;
        const height = width * (imgSombrero.height / imgSombrero.width);
        const cx = (lx + rx) / 2;
        const cy = (ly + ry) / 2 - height * 0.9;
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(angle);
        ctx.scale(1, -1); // Voltear verticalmente
        ctx.drawImage(imgSombrero, -width/2, -height/2, width, height);
        ctx.restore();
      }
    }    // Filtro: solo puntos
    else if (filtro === 'puntos') {
      ctx.save();
      ctx.fillStyle = '#FF9F6B';
      Object.values(keypoints).forEach(arr => {
        arr.forEach(pt => {
          const x = pt[0] * scaleX;
          const y = pt[1] * scaleY;
          ctx.beginPath();
          ctx.arc(x, y, 2, 0, 2 * Math.PI);
          ctx.fill();
        });
      });
      ctx.restore();
    }
  }

  async function main() {
    await setupCamera();
    facemesh = await ml5.facemesh(video, () => {
      statusDiv.textContent = 'Modelo cargado. ¡Selecciona un filtro y mueve tu rostro!';
    });
    facemesh.on('predict', (results) => {
      if (results && results.length > 0) {
        drawFiltro(results[0]);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    });
  }

  main();
});
