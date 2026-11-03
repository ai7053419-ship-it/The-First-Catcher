
const game = document.getElementById("game");
const basket = document.getElementById("basket");

const scoreText = document.getElementById("score");
const timeText = document.getElementById("time");
const bestText = document.getElementById("best");

const message = document.getElementById("message");
const startBtn = document.getElementById("start");

const celebration = document.getElementById("celebration");
const finalScore = document.getElementById("finalScore");

let score = 0;
let lives = 3;
const livesText = document.getElementById("lives");
let time = 30;
let bestScore = Number(localStorage.getItem("bestScore")) || 0;

let basketX = 45;
let running = false;
let gameTimer;
let starTimer;
let sunTimer;

let dragging = false;
let dragOffset = 0;

bestText.textContent = "🏆 Best Score: " + bestScore;

function moveBasketTo(centerX) {
  const width = game.clientWidth;
  const halfBasket = basket.offsetWidth / 2;

  centerX = Math.max(
    halfBasket,
    Math.min(width - halfBasket, centerX)
  );

  basketX = (centerX / width) * 100;
  basket.style.left = basketX + "%";
}

game.addEventListener("pointerdown", (e) => {
  if (!running || !basket.contains(e.target)) return;

  dragging = true;

  const rect = game.getBoundingClientRect();
  const basketRect = basket.getBoundingClientRect();

  const fingerX = e.clientX - rect.left;
  const basketCenter = basketRect.left +
    basketRect.width / 2 - rect.left;

  dragOffset = fingerX - basketCenter;

  game.setPointerCapture(e.pointerId);
  e.preventDefault();
});

game.addEventListener("pointermove", (e) => {
  if (!dragging || !running) return;

  const rect = game.getBoundingClientRect();
  const fingerX = e.clientX - rect.left;

  moveBasketTo(fingerX - dragOffset);
});

function stopDragging() {
  dragging = false;
}

game.addEventListener("pointerup", stopDragging);
game.addEventListener("pointercancel", stopDragging);
game.addEventListener("lostpointercapture", stopDragging);
function createSun() {
  if (!running) return;

  const sun = document.createElement("div");
  sun.className = "sun";
  sun.textContent = "☀️";

  sun.style.left =
    Math.random() * (game.clientWidth - 35) + "px";

  sun.style.top = "-35px";
  game.appendChild(sun);

  let y = -35;

  const fall = setInterval(() => {
    if (!running) {
      clearInterval(fall);
      sun.remove();
      return;
    }

    y += 3;
    sun.style.top = y + "px";

    const sunRect = sun.getBoundingClientRect();
    const basketRect = basket.getBoundingClientRect();

    if (
      sunRect.bottom >= basketRect.top &&
      sunRect.top <= basketRect.bottom &&
      sunRect.right >= basketRect.left &&
      sunRect.left <= basketRect.right
    ) {
      lives--;
      playSound(180, 0.35, "sawtooth");
      livesText.textContent = lives;

      sun.remove();
      clearInterval(fall);

      if (lives <= 0) {
        endGame();
      }

      return;
    }

    if (y > game.clientHeight) {
      sun.remove();
      clearInterval(fall);
    }
  }, 30);
}
function createStar() {
  if (!running) return;

  const star = document.createElement("div");
  star.className = "star";
  star.textContent = "⭐";

  star.style.left =
    Math.random() * (game.clientWidth - 35) + "px";

  star.style.top = "-35px";
  game.appendChild(star);

  let y = -35;

  const fall = setInterval(() => {
    if (!running) {
      clearInterval(fall);
      star.remove();
      return;
    }

    let speed = Math.min(4 + (30 - time) * 0.18, 9);
y += speed;
    star.style.top = y + "px";

    const starRect = star.getBoundingClientRect();
    const basketRect = basket.getBoundingClientRect();

    if (
      starRect.bottom >= basketRect.top &&
      starRect.top <= basketRect.bottom &&
      starRect.right >= basketRect.left &&
      starRect.left <= basketRect.right
    ) {
      score++;
      scoreText.textContent = score;
playSound(880, 0.15, "sine");
      if (score > bestScore) {
        bestScore = score;
        bestText.textContent = "🏆 Best Score: " + bestScore;
        localStorage.setItem("bestScore", bestScore);
      }

      star.remove();
      clearInterval(fall);
    }

    if (y > game.clientHeight) {
      star.remove();
      clearInterval(fall);
    }
  }, 30);
}

function startGame() {
  if (running) return;

  clearInterval(gameTimer);
  clearInterval(starTimer);

  score = 0;
  time = 30;
  basketX = 45;
  lives = 3;
livesText.textContent = "3";
  dragging = false;

  scoreText.textContent = score;
  timeText.textContent = time;

  basket.style.left = basketX + "%";

  celebration.classList.add("hidden");

  message.textContent = "Catch as many stars as you can!";
  startBtn.textContent = "GAME RUNNING";

  game.querySelectorAll(".star").forEach(star => {
    star.remove();
  });

  running = true;
  playSound(600, 0.25, "sine");

  starTimer = setInterval(createStar, 900);
  sunTimer = setInterval(createSun, 2500);

  gameTimer = setInterval(() => {
    time--;
    timeText.textContent = time;

    if (time <= 0) {
      endGame();
    }
  }, 1000);
}

function endGame() {
  running = false;
  dragging = false;

  clearInterval(gameTimer);
  clearInterval(starTimer);
  clearInterval(sunTimer);

  finalScore.textContent = score;
  playSound(523, 0.2, "sine");

setTimeout(() => playSound(659, 0.2, "sine"), 200);
setTimeout(() => playSound(784, 0.4, "sine"), 400);
  celebration.classList.remove("hidden");

  startBtn.textContent = "PLAY AGAIN";
}

startBtn.addEventListener("click", startGame);
let soundOn = true;

const audioContext = new (window.AudioContext || window.webkitAudioContext)();

function playSound(frequency, duration, type = "sine") {
  if (!soundOn) return;

  if (audioContext.state === "suspended") {
    audioContext.resume();
  }

  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();

  oscillator.connect(gain);
  gain.connect(audioContext.destination);

  oscillator.type = type;
  oscillator.frequency.value = frequency;

  gain.gain.setValueAtTime(0.15, audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(
    0.001,
    audioContext.currentTime + duration
  );

  oscillator.start();
  oscillator.stop(audioContext.currentTime + duration);
}
const soundBtn = document.getElementById("soundBtn");

soundBtn.addEventListener("click", () => {
  soundOn = !soundOn;

  soundBtn.textContent = soundOn
    ? "🔊 SOUND ON"
    : "🔇 SOUND OFF";
});