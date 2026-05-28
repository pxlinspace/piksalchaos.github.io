const canvas = document.getElementById("idiot-canvas");
const context = canvas.getContext("2d");

function setupCanvas() {
  const rect = canvas.getBoundingClientRect();

  canvas.width = rect.width;
  canvas.height = rect.height;

  context.imageSmoothingEnabled = false;
}

const observer = new ResizeObserver((entries) => {
  setupCanvas();
  draw();
});
observer.observe(canvas);

const image = new Image();
image.src = "images/idiot-Sheet.png";

let previousTime = null;
const MAX_DELTA = 1 / 10;

class Idiot {
  static SPEED = 150;

  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  update(dt) {
    this.x += Idiot.SPEED * dt;
  }

  draw(context) {}

  getAlpha() {
    return (Math.sin(this.alphaRadians) + 1) / 2;
  }
}

function update(timestamp) {
  const dt = previousTime
    ? Math.min((timestamp - previousTime) / 1000, MAX_DELTA)
    : 0;
  previousTime = timestamp;

  draw();
  requestAnimationFrame(update);
}

function draw() {
  const dpr = 1;

  context.clearRect(0, 0, canvas.width, canvas.height);
  context.imageSmoothingEnabled = false; // safety: re-assert every frame

  context.drawImage(image, 0, 0, 16, 16, 2, 2, 48 * dpr, 48 * dpr);
}

requestAnimationFrame(update);
