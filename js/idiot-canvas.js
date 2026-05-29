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
  static GRAVITY = 500;
  static RECT_SIZE = 16;
  static SPRITE_SCALE = 3;
  static FRAME_COUNTS = [4, 2];
  static ANIMATION_TIMES = [125, 75];
  static getSize() {
    return Idiot.RECT_SIZE * Idiot.SPRITE_SCALE;
  }

  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.yVelocity = 0;
    this.animationRow = 0;
    this.frame = 0;
    this.animationIntervalId = null;
    this._isGrabbed = false;
    this.isMoving = false;
    this.movementTimeoutId = null;
    this.xDirection = 1;
    this.continueMovementProcess();
  }

  update(dt) {
    if (!this.isGrabbed) {
      if (this.y < canvas.height - Idiot.getSize() * 0.5) {
        this.yVelocity += Idiot.GRAVITY * dt;
        this.y += this.yVelocity * dt;
      } else {
        this.y = canvas.height - Idiot.getSize() * 0.5;
        this.yVelocity = 0;

        if (this.animationRow == 1) {
          this.animationRow = 0;
          this.frame = 0;
          clearInterval(this.animationIntervalId);
          this.animationIntervalId = null;
        }

        if (!this.movementTimeoutId) {
          this.animationIntervalId = null;
          this.continueMovementProcess();
        }
      }
    }

    if (this.isMoving) {
      this.x += Idiot.SPEED * dt * this.xDirection;
      if (this.animationIntervalId === null) {
        this.animationIntervalId = setInterval(
          this.gotoNextFrame.bind(this),
          Idiot.ANIMATION_TIMES[this.animationRow],
        );
      }
    } else if (
      !this.isGrabbed &&
      this.y === canvas.height - Idiot.getSize() * 0.5
    ) {
      if (this.animationIntervalId !== null) {
        clearInterval(this.animationIntervalId);
        this.animationIntervalId = null;
      }
      this.frame = 0;
    }
  }

  gotoNextFrame() {
    this.frame += 1;
    if (this.frame >= Idiot.FRAME_COUNTS[this.animationRow]) {
      this.frame = 0;
    }
  }

  continueMovementProcess() {
    this.movementTimeoutId = setTimeout(
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

    const size = Idiot.getSize();
    context.drawImage(
      image,
      this.frame * Idiot.RECT_SIZE,
      this.animationRow * Idiot.RECT_SIZE,
      Idiot.RECT_SIZE,
      Idiot.RECT_SIZE,
      -size * 0.5,
      -size * 0.5,
      size,
      size,
    );
    context.restore();
  }

  get isGrabbed() {
    return this._isGrabbed;
  }

  set isGrabbed(value) {
    this._isGrabbed = value;
    if (value) {
      this.isMoving = false;
      this.frame = 0;
      if (this.movementTimeoutId) {
        clearTimeout(this.movementTimeoutId);
        this.movementTimeoutId = null;
      }
      this.animationRow = 1;
      clearInterval(this.animationIntervalId);
      this.animationIntervalId = setInterval(
        this.gotoNextFrame.bind(this),
        Idiot.ANIMATION_TIMES[this.animationRow],
      );
    } else {
      this.yVelocity = 0;
    }
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
    idiots.push(
      new Idiot(
        Math.random() * canvas.width,
        canvas.height - Idiot.getSize() * 0.5,
      ),
    );
  }
}

requestAnimationFrame(update);

const MAX_MOUSE_DISTANCE = 50;
addEventListener("mousedown", (event) => {
  if (event.button !== 0) return;

  const canvasRect = canvas.getBoundingClientRect();

  let mouseX = event.clientX - canvasRect.left;
  let mouseY = event.clientY - canvasRect.top;

  let closestIdiotIndex = null;
  let closestDistance = Infinity;
  for (let i = 0; i < idiots.length; i++) {
    const distance = Math.hypot(mouseX - idiots[i].x, mouseY - idiots[i].y);
    if (distance < closestDistance && distance < MAX_MOUSE_DISTANCE) {
      closestIdiotIndex = i;
      closestDistance = distance;
    }
  }
  if (closestIdiotIndex !== null) {
    idiots[closestIdiotIndex].isGrabbed = true;
    setIdiotToMouse(idiots[closestIdiotIndex], mouseX, mouseY);
  }
});
addEventListener("mouseup", (event) => {
  if (event.button !== 0) return;

  for (let i = 0; i < idiots.length; i++) {
    idiots[i].isGrabbed = false;
  }
});

addEventListener("mousemove", (event) => {
  const canvasRect = canvas.getBoundingClientRect();
  let mouseX = event.clientX - canvasRect.left;
  let mouseY = event.clientY - canvasRect.top;
  for (let i = 0; i < idiots.length; i++) {
    if (idiots[i].isGrabbed) {
      setIdiotToMouse(idiots[i], mouseX, mouseY);
    }
  }
  draw();
});

function setIdiotToMouse(idiot, mouseX, mouseY) {
  const distance = Idiot.getSize() * 0.5;
  idiot.x = Math.max(distance, Math.min(canvas.width - distance, mouseX));
  idiot.y = Math.max(distance, Math.min(canvas.height - distance, mouseY));
}
