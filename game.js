const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Game variables
let paddleX = canvas.width / 2 - 50;
let paddleWidth = 250;
const paddleHeight = 16;
let rightPressed = false;
let leftPressed = false;

// Bricks
let bricks = [];
let brickRowCount,
  brickColumnCount,
  brickWidth,
  brickHeight,
  brickPadding,
  brickOffsetTop,
  brickOffsetLeft;

// Font Awesome icon classes to use for bricks
const iconClasses = [
  "fa-star",
  "fa-heart",
  "fa-gem",
  "fa-leaf",
  "fa-bolt",
  "fa-moon",
  "fa-snowflake",
  "fa-sun",
  "fa-rocket",
  "fa-apple-alt",
  "fa-bug",
  "fa-fish",
  "fa-lemon",
  "fa-smile",
  "fa-music",
  "fa-paw",
  "fa-tree",
  "fa-umbrella",
  "fa-bell",
  "fa-cube",
];
const iconPrefix = "fas"; // solid style
const iconColors = [
  "#ff7675",
  "#74b9ff",
  "#ffeaa7",
  "#55efc4",
  "#fd79a8",
  "#fdcb6e",
  "#00b894",
  "#00cec9",
  "#e17055",
  "#6c5ce7",
  "#fab1a0",
  "#636e72",
  "#e17055",
  "#00b894",
  "#fdcb6e",
  "#0984e3",
  "#d35400",
  "#e84393",
  "#00b894",
  "#fdcb6e",
];

function giveHaptic(val = 200) {
  if ("vibrate" in navigator) {
    navigator.vibrate(val); // short tap
  } else {
    console.log("Vibration API not supported");
  }
}

function calculateBricks() {
  // Brick size and padding
  const brickWidth = 75;
  const brickHeight = 24;
  const brickPadding = 10;
  const brickOffsetTop = 40;
  const brickOffsetLeft = 35;
  // Calculate columns and rows based on canvas size
  let brickColumnCount = Math.floor(
    (canvas.width - brickOffsetLeft * 2 + brickPadding) /
      (brickWidth + brickPadding)
  );
  let brickRowCount = Math.floor(
    (canvas.height * 0.3 - brickOffsetTop + brickPadding) /
      (brickHeight + brickPadding)
  );
  // Clamp to at least 1, and at most 20 cols, 10 rows
  brickColumnCount = Math.max(1, Math.min(brickColumnCount, 20));
  brickRowCount = Math.max(1, Math.min(brickRowCount, 10));
  return {
    brickColumnCount,
    brickRowCount,
    brickWidth,
    brickHeight,
    brickPadding,
    brickOffsetTop,
    brickOffsetLeft,
  };
}

function setupBricks() {
  const calc = calculateBricks();
  brickColumnCount = calc.brickColumnCount;
  brickRowCount = calc.brickRowCount;
  brickWidth = calc.brickWidth;
  brickHeight = calc.brickHeight;
  brickPadding = calc.brickPadding;
  brickOffsetTop = calc.brickOffsetTop;
  brickOffsetLeft = calc.brickOffsetLeft;
  bricks = [];
  for (let c = 0; c < brickColumnCount; c++) {
    bricks[c] = [];
    for (let r = 0; r < brickRowCount; r++) {
      // Assign a random icon and color to each brick
      const iconIdx = Math.floor(Math.random() * iconClasses.length);
      const colorIdx = Math.floor(Math.random() * iconColors.length);
      bricks[c][r] = {
        x: 0,
        y: 0,
        status: 1,
        icon: iconClasses[iconIdx],
        color: iconColors[colorIdx],
      };
    }
  }
}

// Ball
let x = canvas.width / 2;
let y = canvas.height - paddleHeight - 30; // Start above the paddle
let dx = 8;
let dy = -8;
const ballRadius = 12;

function drawBricks() {
  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  for (let c = 0; c < brickColumnCount; c++) {
    for (let r = 0; r < brickRowCount; r++) {
      const b = bricks[c][r];
      if (b.status === 1) {
        const brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
        const brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
        b.x = brickX;
        b.y = brickY;
        // Draw Font Awesome icon as text
        ctx.font = `${Math.floor(brickHeight * 0.9)}px FontAwesome`;
        ctx.fillStyle = b.color;
        ctx.shadowColor = "#222";
        ctx.shadowBlur = 8;
        // Use Unicode for icon
        const iconElem = document.createElement("i");
        iconElem.className = `${iconPrefix} ${b.icon}`;
        document.body.appendChild(iconElem);
        const iconChar = window
          .getComputedStyle(iconElem, ":before")
          .content.replace(/['"]/g, "");
        document.body.removeChild(iconElem);
        ctx.fillText(
          iconChar,
          brickX + brickWidth / 2,
          brickY + brickHeight / 2
        );
        ctx.shadowBlur = 0;
      }
    }
  }
  ctx.restore();
}

function drawBall() {
  ctx.beginPath();
  ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
  ctx.fillStyle = "#fff";
  ctx.shadowColor = "#00e6e6";
  ctx.shadowBlur = 16;
  ctx.fill();
  ctx.closePath();
  ctx.shadowBlur = 0;
}

function drawPaddle() {
  ctx.beginPath();
  ctx.rect(
    paddleX,
    canvas.height - paddleHeight - 100,
    paddleWidth,
    paddleHeight
  );
  ctx.fillStyle = "#ffb347";
  ctx.fill();
  ctx.closePath();
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function resetBallAndPaddle() {
  // Paddle random X within canvas
  paddleX = getRandomInt(0, canvas.width - paddleWidth);
  // Ball random X within canvas, Y above paddle
  x = getRandomInt(ballRadius, canvas.width - ballRadius);
  y = getRandomInt(
    canvas.height - paddleHeight - 60,
    canvas.height - paddleHeight - 400
  );
  dx = 6 * (Math.random() < 0.5 ? 1 : -1);
  dy = -6;
}

let gameStarted = false;
function startGame() {
  if (!gameStarted) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    setupBricks();
    resetBallAndPaddle();
    giveHaptic(400); // Long haptic feedback for game start
    gameStarted = true;
    draw();
  }
}

function collisionDetection() {
  for (let c = 0; c < brickColumnCount; c++) {
    for (let r = 0; r < brickRowCount; r++) {
      const b = bricks[c][r];
      if (b.status === 1) {
        if (
          x > b.x &&
          x < b.x + brickWidth &&
          y > b.y &&
          y < b.y + brickHeight
        ) {
          dy = -dy;
          b.status = 0;
          giveHaptic(100); // Haptic feedback for brick collision
        }
      }
    }
  }
}

function draw() {
  if (!gameStarted) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBricks();
  drawBall();
  drawPaddle();
  collisionDetection();

  if (x + dx > canvas.width - ballRadius || x + dx < ballRadius) {
    dx = -dx;
  }
  if (y + dy < ballRadius) {
    dy = -dy;
  } else if (y + dy > canvas.height - paddleHeight - 10 - ballRadius) {
    if (x > paddleX && x < paddleX + paddleWidth) {
      dy = -dy;
      giveHaptic(200); // Haptic feedback for paddle collision
    } else if (y + dy > canvas.height - ballRadius) {
      gameStarted = false; // Game over
      giveHaptic(500); // Haptic feedback for game over
      // document.location.reload();
    }
  }

  if (rightPressed && paddleX < canvas.width - paddleWidth) {
    paddleX += 8;
  } else if (leftPressed && paddleX > 0) {
    paddleX -= 8;
  }

  x += dx;
  y += dy;
  if (gameStarted) requestAnimationFrame(draw);
}

const faceMesh = new FaceMesh({
  locateFile: (file) =>
    `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
});

faceMesh.setOptions({
  maxNumFaces: 1,
  refineLandmarks: true,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5,
});

const smoothFactor = 0.15;
let noseCenterPx = null;
const noseRangePx = 200;

faceMesh.onResults((results) => {
  if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
    startGame(); // Start game on first face detection
    // const nose = results.multiFaceLandmarks[0][1];
    const nose = results.multiFaceLandmarks[0][1];
    // Convert normalized x to pixel x in video
    const nosePx = -1 * nose.x * canvas.width;
    if (noseCenterPx === null) {
      noseCenterPx = nosePx; // set center on first detection
    }
    // Calculate offset from center, clamp to [-noseRangePx/2, noseRangePx/2]
    let offset = nosePx - noseCenterPx;
    offset = Math.max(-noseRangePx / 2, Math.min(noseRangePx / 2, offset));
    // Map offset to [0, 1] for faceX
    faceX = (offset + noseRangePx / 2) / noseRangePx;

    const targetX = faceX * (canvas.width - paddleWidth);
    paddleX += (targetX - paddleX) * smoothFactor;
  }
});

const camera = new Camera(video, {
  onFrame: async () => {
    await faceMesh.send({ image: video });
  },
  width: 640,
  height: 480,
});

camera.start();
