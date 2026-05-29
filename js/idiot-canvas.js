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
  if (idiots.length === 0) {
    initialize();
  }
  draw();
});
observer.observe(canvas);

const image = new Image();
image.src = "images/idiot-Sheet.png";

let previousTime = null;
const MAX_DELTA = 1 / 10;

let idiots = [];

class Idiot {
  static SPEED = 75;
  static RECT_SIZE = 16;
  static SPRITE_SCALE = 3;
  static FRAME_COUNT = 4;
  static ANIMATION_TIME = 125;

  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.frame = 0;
    this.animationIntervalId = null;
    this.isMoving = false;
    this.xDirection = 1;
    this.continueMovementProcess();
  }

  update(dt) {
    if (this.isMoving) {
      this.x += Idiot.SPEED * dt * this.xDirection;
      if (this.animationIntervalId === null) {
        this.animationIntervalId = setInterval(
          this.gotoNextFrame.bind(this),
          Idiot.ANIMATION_TIME,
        );
      }
    } else {
      if (this.animationIntervalId !== null) {
        clearInterval(this.animationIntervalId);
        this.animationIntervalId = null;
      }
      this.frame = 0;
    }
  }

  gotoNextFrame() {
    this.frame += 1;
    if (this.frame >= Idiot.FRAME_COUNT) {
      this.frame = 0;
    }
  }

  continueMovementProcess() {
    setTimeout(
      () => {
        this.continueMovementProcess();
        this.isMoving = !this.isMoving;
        if (this.isMoving) {
          this.gotoNextFrame();
          if (this.x < 200) {
            this.xDirection = 1;
          } else if (this.x > canvas.width - 200) {
            this.xDirection = -1;
          } else {
            this.xDirection = Math.random() > 0.5 ? 1 : -1;
          }
        }
      },
      750 + Math.random() * 1500,
    );
  }

  draw(context) {
    context.save();
    context.translate(this.x, this.y);
    context.scale(this.xDirection, 1);
    context.drawImage(
      image,
      this.frame * Idiot.RECT_SIZE,
      0,
      Idiot.RECT_SIZE,
      Idiot.RECT_SIZE,
      -Idiot.RECT_SIZE * Idiot.SPRITE_SCALE * 0.5,
      0,
      Idiot.RECT_SIZE * Idiot.SPRITE_SCALE,
      Idiot.RECT_SIZE * Idiot.SPRITE_SCALE,
    );
    context.restore();
  }

  getAlpha() {
    return (Math.sin(this.alphaRadians) + 1) / 2;
  }
}

function update(timestamp) {
  const dt = previousTime
    ? Math.min((timestamp - previousTime) / 1000, MAX_DELTA)
    : 0;
  previousTime = timestamp;

  for (let i = 0; i < idiots.length; i++) {
    idiots[i].update(dt);
  }

  draw();
  requestAnimationFrame(update);
}

function draw() {
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.imageSmoothingEnabled = false;
  for (let i = 0; i < idiots.length; i++) {
    idiots[i].draw(context);
  }
}

function initialize() {
  for (let i = 0; i < 3; i++) {
    idiots.push(new Idiot(Math.random() * canvas.width, 2));
  }
}

requestAnimationFrame(update);
