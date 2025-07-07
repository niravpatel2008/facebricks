const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Game variables
let paddleX = canvas.width / 2 - 50;
let paddleWidth = 250;
let currentLevel = 1;
let lives = 3;
const maxLevel = 5; // Let's define a maximum number of levels
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
  // Calculate columns based on canvas size
  let brickColumnCount = Math.floor(
    (canvas.width - brickOffsetLeft * 2 + brickPadding) /
      (brickWidth + brickPadding)
  );
  // Clamp to at least 1, and at most 20 cols
  brickColumnCount = Math.max(1, Math.min(brickColumnCount, 20));

  // Determine brick rows based on current level
  // Start with a base number of rows and add more for higher levels
  let baseBrickRowCount = 3; // Minimum rows for level 1
  let maxBrickRowCount = 8;  // Maximum rows for higher levels
  // Increase rows by 1 for each level, up to maxBrickRowCount
  let brickRowCount = Math.min(baseBrickRowCount + currentLevel -1 , maxBrickRowCount);
  // Ensure at least 1 row even if logic is flawed
  brickRowCount = Math.max(1, brickRowCount);


  // Fallback if canvas height is very small, to prevent too many rows
  let maxRowsByHeight = Math.floor(
    (canvas.height * 0.4 - brickOffsetTop + brickPadding) / // Use up to 40% of height for bricks
      (brickHeight + brickPadding)
  );
  brickRowCount = Math.min(brickRowCount, maxRowsByHeight);
  brickRowCount = Math.max(1, Math.min(brickRowCount, 10)); // Overall clamp

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
    canvas.height - paddleHeight - 50,
    paddleWidth,
    paddleHeight
  );
  ctx.fillStyle = "#ffb347";
  ctx.fill();
  ctx.closePath();
}

function drawGameInfo() {
  ctx.font = "20px Arial";
  ctx.fillStyle = "#FFF";
  ctx.textAlign = "left";
  ctx.fillText("Level: " + currentLevel, 10, 25);
  ctx.textAlign = "right";
  ctx.fillText("Lives: " + lives, canvas.width - 10, 25);
  ctx.textAlign = "center"; // Reset for other functions if they rely on it
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

          // Check if all bricks are cleared
          let bricksCleared = true;
          for (let c2 = 0; c2 < brickColumnCount; c2++) {
            for (let r2 = 0; r2 < brickRowCount; r2++) {
              if (bricks[c2][r2].status === 1) {
                bricksCleared = false;
                break;
              }
            }
            if (!bricksCleared) break;
          }

          if (bricksCleared) {
            currentLevel++;
            if (currentLevel > maxLevel) {
              // Win condition will be handled by a popup later
              // For now, just log it and stop the game.
              console.log("You Win!");
              showGameMessage("You Win!", `Congratulations! You completed all ${maxLevel} levels.`, "Play Again?", resetGame);
              gameStarted = false;
            } else {
              setupBricks();
              resetBallAndPaddle();
              // Increase ball speed slightly for the new level
              dx = dx > 0 ? dx + 0.5 : dx - 0.5;
              dy = dy > 0 ? dy + 0.5 : dy - 0.5;
              giveHaptic(300); // Haptic feedback for leveling up
            }
          }
        }
      }
    }
  }
}

function resetGame() {
    currentLevel = 1;
    lives = 3;
    setupBricks();
    resetBallAndPaddle();
    // Reset ball speed
    dx = 6 * (Math.random() < 0.5 ? 1 : -1);
    dy = -6;
    gameStarted = true;
    hideGameMessage(); // Hide any popups
    draw(); // Restart the game loop
}

function showGameMessage(title, message, buttonText, callback) {
  let popup = document.getElementById("gamePopup");
  if (!popup) {
    popup = document.createElement("div");
    popup.id = "gamePopup";
    popup.className = "popup"; // Use existing CSS class
    popup.style.display = "none"; // Initially hidden

    const content = document.createElement("div");
    content.className = "popup-content"; // Use existing CSS class

    const h2 = document.createElement("h2");
    h2.id = "popupTitle";
    content.appendChild(h2);

    const p = document.createElement("p");
    p.id = "popupMessage";
    content.appendChild(p);

    const button = document.createElement("button");
    button.id = "popupButton";
    button.onclick = () => { // Arrow function to ensure correct `this` or scope for callback
        if(callback) callback();
    };
    content.appendChild(button);

    popup.appendChild(content);
    document.body.appendChild(popup);
  }

  document.getElementById("popupTitle").textContent = title;
  document.getElementById("popupMessage").textContent = message;
  const popupButton = document.getElementById("popupButton");
  popupButton.textContent = buttonText;
  // Re-assign onclick to the new callback, as it might change (e.g. win vs loss)
  popupButton.onclick = () => {
      if(callback) callback();
  };


  popup.style.display = "flex"; // Show the popup
}

function hideGameMessage() {
  const popup = document.getElementById("gamePopup");
  if (popup) {
    popup.style.display = "none";
  }
}

function draw() {
  if (!gameStarted) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBricks();
  drawBall();
  drawPaddle();
  drawGameInfo(); // Draw lives and level
  collisionDetection();

  if (x + dx > canvas.width - ballRadius || x + dx < ballRadius) {
    dx = -dx;
  }
  if (y + dy < ballRadius) {
    dy = -dy;
  } else if (y + dy > canvas.height - paddleHeight - 50 - ballRadius) {
    if (x > paddleX && x < paddleX + paddleWidth) {
      dy = -dy;
      giveHaptic(200); // Haptic feedback for paddle collision
    } else if (y + dy > canvas.height - ballRadius) { // Ball hit the bottom
      lives--;
      giveHaptic(500); // Haptic feedback for losing a life / game over
      if (lives > 0) {
        resetBallAndPaddle();
        // Keep gameStarted = true;
      } else {
        // Game Over
        console.log("Game Over!");
        showGameMessage("Game Over!", `You reached level ${currentLevel}.`, "Try Again?", resetGame);
        gameStarted = false;
      }
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
