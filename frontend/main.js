const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = 640;
canvas.height = 480;

// Lip landmark indices (MediaPipe)
const LIPS = [61,146,91,181,84,17,314,405,321,375,291];

// Contour zones (approx)
const LEFT_CONTOUR = [234,93,132,58];
const RIGHT_CONTOUR = [454,323,361,288];

function drawPolygon(points, color, alpha=0.4) {
  ctx.beginPath();
  ctx.moveTo(points[0].x * canvas.width, points[0].y * canvas.height);

  points.forEach(p => {
    ctx.lineTo(p.x * canvas.width, p.y * canvas.height);
  });

  ctx.closePath();
  ctx.fillStyle = color;
  ctx.globalAlpha = alpha;
  ctx.fill();
  ctx.globalAlpha = 1;
}

function renderMakeup(landmarks) {
  ctx.clearRect(0,0,canvas.width,canvas.height);

  // --- LIPSTICK ---
  const lipPoints = LIPS.map(i => landmarks[i]);
  drawPolygon(lipPoints, "red", 0.5);

  // --- CONTOUR ---
  const left = LEFT_CONTOUR.map(i => landmarks[i]);
  const right = RIGHT_CONTOUR.map(i => landmarks[i]);

  drawPolygon(left, "brown", 0.3);
  drawPolygon(right, "brown", 0.3);
}

async function sendToBackend(landmarks) {
  const res = await fetch("http://localhost:8000/api/analyze", {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({landmarks})
  });
  return res.json();
}

// MediaPipe setup
const faceMesh = new FaceMesh({
  locateFile: (file) =>
    `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
});

faceMesh.setOptions({
  maxNumFaces: 1,
  refineLandmarks: true
});

faceMesh.onResults(async (results) => {
  if (results.multiFaceLandmarks.length > 0) {
    const lm = results.multiFaceLandmarks[0];

    renderMakeup(lm);

    // OPTIONAL: backend call (throttle in production)
    const data = await sendToBackend(lm);
    console.log(data);
  }
});

// Camera
const camera = new Camera(video, {
  onFrame: async () => {
    await faceMesh.send({ image: video });
  },
  width: 640,
  height: 480
});

camera.start();
