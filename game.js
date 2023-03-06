let board;
let boxSize = 20;
let penArr = ["m", "f"];
let pen = "m";
let patternText = {
  default: `x`,
  block: `xx
xx`,
  loaf: `.xx.
x..x
.x.x
..x.`,
  blinker: `x
x
x`,
  glider: `.x.
..x
xxx`,
};

function updatePattern(type) {
  pattern = patternText[type]
    .split("\n")
    .flatMap((line, y) =>
      line.split("").map((char, x) => ({ x, y, alive: char == "x" }))
    );
}
function Board(width, height) {
  let board = new Array(width);
  let babyCount, maleCount, femaleCount;
  for (let x = 0; x < width; x++) {
    board[x] = new Array(height);
    for (let y = 0; y < height; y++) {
      board[x][y] = Box(x, y);
      babyCount = 0;
      maleCount = 0;
      femaleCount = 0;
    }
  }

  function init() {
    // requestAnimationFrame(update);
    clear();
    forEachBox((box) => {
      box.reset();
    });
  }
  function getBox(x, y) {
    return board[x]?.[y];
  }
  function forEachBox(fn) {
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        fn(board[x][y], x, y);
      }
    }
  }

  function getCount() {
    babyCount = 0;
    maleCount = 0;
    femaleCount = 0;
    forEachBox((box) => {
      if (box.isBaby()) babyCount++;
      else {
        if (box.m.isAlive()) maleCount++;
        if (box.f.isAlive()) femaleCount++;
      }
    });
    return [babyCount, maleCount, femaleCount];
  }

  let prevSelection = [-1, -1];
  let currentSelection = [-1, -1];
  function checkBoundary(x, y) {
    return !(x > width - 1 || x < 0 || y > height - 1 || y < 0);
  }
  function clearSelection() {
    let xCor = currentSelection[0];
    let yCor = currentSelection[1];
    if (!board[xCor] || !board[xCor][yCor]) return;
    pattern.forEach((cell) => {
      if (checkBoundary(xCor + cell.x, yCor + cell.y))
        board[xCor + cell.x][yCor + cell.y].draw();
    });
    prevSelection = [-1, -1];
    currentSelection = [-1, -1];
  }

  function selection(x, y) {
    currentSelection = [x, y];
    if (!board[x] || !board[x][y]) {
      //   console.log(`box ${x} not exist`);
      return;
    }
    if (
      prevSelection[0] == currentSelection[0] &&
      prevSelection[1] == currentSelection[1]
    )
      return;

    if (prevSelection[0] != -1 && prevSelection[1] != -1)
      //clearing previous selection
      pattern.forEach((cell) => {
        if (
          checkBoundary(prevSelection[0] + cell.x, +prevSelection[1] + cell.y)
        ) {
          board[prevSelection[0] + cell.x][
            prevSelection[1] + cell.y
          ].drawBorder();
        }
      });
    // drawing new selection
    pattern.forEach((cell) => {
      if (checkBoundary(x + cell.x, y + cell.y)) {
        if (cell.alive) {
          board[x + cell.x][y + cell.y].select();
        }
      }
    });
    prevSelection = [...currentSelection];
  }
  function tick() {
    clear();
    forEachBox((box, x, y) => {
      for (let penType of penArr) {
        box[penType].resetPeerCount();
      }
      for (let dx of [-1, 0, +1]) {
        for (let dy of [-1, 0, +1]) {
          if (dx == 0 && dy == 0) continue;
          let px = (x + dx + width) % width;
          let py = (y + dy + height) % height;
          1;
          let peer = board[px][py];
          if (peer.isBaby()) {
            continue;
          }
          for (let penType of penArr) {
            if (peer[penType].isAlive()) {
              box[penType].incPeerCount();
            }
          }
        }
      }
    });
    forEachBox((box) => {
      box.tick();
    });
  }
  return {
    init,
    getBox,
    forEachBox,
    tick,
    getCount,
    width,
    height,
    selection,
    clearSelection,
  };
}
function paintFrame() {
  for (let i = 0; i < board.width; i++) {
    for (let j = 0; j < board.height; j++) {
      stroke(0);
      fill(0, 0, 0, 0);
      rect(i * boxSize, j * boxSize, boxSize, boxSize);
    }
  }
}
function Box(x, y) {
  let left = x * boxSize;
  let top = y * boxSize;
  let baby = false;
  let box = {
    draw,
    tick,
    isBaby,
    reset,
    select,
    drawBorder,
  };

  box.m = Life(box);
  box.f = Life(box);
  function select() {
    let r = 0;
    let g = 0;
    let b = 0;
    if (pen == "m") b = 255;
    else if (pen == "f") r = 255;
    // console.log("selected", { x, y });
    strokeWeight(2);
    stroke([r, g, b]);
    fill(0, 0, 0, 0);
    rect(left, top, boxSize, boxSize);
  }
  function reset() {
    // console.log("running reset");
    for (let penType of penArr) {
      box[penType].resetPeerCount();
      //   box[penType].die();
    }
    baby = false;
    // box.m.resetPeerCount();
    // box.f.resetPeerCount();
    box.m.die();
    box.f.die();

    box.draw();
  }

  function isBaby() {
    return baby;
  }

  function tick() {
    box.m.tick();
    box.f.tick();

    box.draw();
  }
  function drawBorder() {
    stroke(0);
    fill(0, 0, 0, 0);
    rect(left, top, boxSize, boxSize);
  }
  function draw() {
    frameRate(+fps);
    stroke(0);
    strokeWeight(2);
    if (baby) {
      fill([0, 0, 0, 0]);
      rect(left, top, boxSize, boxSize);
      image(babyImg, left, top, boxSize, boxSize);
      return;
    }
    if (box.m.isAlive() && box.f.isAlive()) {
      baby = true;
      fill([0, 0, 0, 0]);
      rect(left, top, boxSize, boxSize);
      image(babyImg, left, top, boxSize, boxSize);
      return;
    } else {
      if (box.m.isAlive()) {
        console.log("male alive");
        // fill([0, 0, 255, 255]);
        fill([0, 0, 0, 0]);
        rect(left, top, boxSize, boxSize);
        image(maleImg, left, top, boxSize, boxSize);
        return;

        // console.log("triggered male");
      }
      if (box.f.isAlive()) {
        console.log("female alive");
        // fill([255, 0, 0, 255]);
        fill([0, 0, 0, 0]);
        rect(left, top, boxSize, boxSize);
        image(femaleImg, left, top, boxSize, boxSize);
        return;
        // console.log("triggered female");
      } else {
        fill([0, 0, 0, 0]);
        rect(left, top, boxSize, boxSize);
        return;
      }
    }

    console.log("draw deadbody", { x, y });

    // fill([0, 0, 0, 0]);
    // rect(left, top, boxSize, boxSize);

    fill([r, g, b, 0]);
    rect(left, top, boxSize, boxSize);
  }

  return box;
}

function Life(box) {
  let alive = false;
  let peerCount = 0;

  function tick() {
    // console.log(peerCount);
    if (box.isBaby()) {
      // box.draw();
      return;
    }
    if (alive && peerCount < 2) {
      die();
      return;
    }
    if (alive && peerCount > 3) {
      die();
      return;
    }
    if (!alive && peerCount == 3) {
      born();
      return;
    }
  }

  function born() {
    alive = true;
  }
  function die() {
    alive = false;
  }
  function isAlive() {
    return alive;
  }
  function resetPeerCount() {
    peerCount = 0;
  }
  function incPeerCount() {
    peerCount++;
  }
  return {
    tick,
    born,
    die,
    isAlive,
    resetPeerCount,
    incPeerCount,
  };
}

function wait(ms) {
  var start = new Date().getTime();
  var end = start;
  while (end < start + ms) {
    end = new Date().getTime();
  }
}
class Utils {
  // Calculate the Width in pixels of a Dom element
  static elementWidth(element) {
    return (
      element.clientWidth -
      parseFloat(
        window.getComputedStyle(element, null).getPropertyValue("padding-left")
      ) -
      parseFloat(
        window.getComputedStyle(element, null).getPropertyValue("padding-right")
      )
    );
  }

  // Calculate the Height in pixels of a Dom element
  static elementHeight(element) {
    return (
      element.clientHeight -
      parseFloat(
        window.getComputedStyle(element, null).getPropertyValue("padding-top")
      ) -
      parseFloat(
        window
          .getComputedStyle(element, null)
          .getPropertyValue("padding-bottom")
      )
    );
  }
}
let maleImg, femaleImg;
function preload() {
  babyImg = loadImage("assets/baby.jpg");
  maleImg = loadImage("assets/male.png");
  femaleImg = loadImage("assets/female.png");
}
function setup() {
  // console.log()
  let canvasDiv = document.querySelector("#canvas-container");

  let width = Math.floor((canvasDiv.clientWidth * 0.9) / boxSize);

  let height = Math.floor((windowHeight * 0.5) / boxSize);

  board = Board(width, height);
  const canvas = createCanvas(width * boxSize, height * boxSize);
  canvas.parent(document.querySelector("#canvas-container"));

  canvas.mouseMoved(hover);
  canvas.mouseOut(clearSelection);
  requestAnimationFrame(update);

  noLoop();
}

function clearSelection() {
  //   console.log("cleared");
  board.clearSelection();
}

function hover() {
  // console.log("checking");
  noLoop();
  const x = Math.floor(mouseX / boxSize);
  const y = Math.floor(mouseY / boxSize);
  //   console.log({ x, y });
  board.selection(x, y);
  //   let box = board.getBox(x, y);
  //   box?.select();
}

function draw() {
  board.tick();
}
function mousePressed(event) {
  let refX = Math.floor(mouseX / boxSize);
  let refY = Math.floor(mouseY / boxSize);
  if (refX > -1 && refY > -1) {
    noLoop();
    mouseDragged(event);
  }
}
function mouseDragged(event) {
  let refX = Math.floor(mouseX / boxSize);
  let refY = Math.floor(mouseY / boxSize);
  if (refX > -1 && refY > -1) {
    pattern.forEach((cell) => {
      if (cell.alive) {
        let box = board.getBox(refX + cell.x, refY + cell.y);
        box?.[pen].born();
        box.draw();
      }
    });
  }
}
function windowResized() {
  setup();
  board.init();
}
function mouseReleased(event) {}
document.querySelector("#tick-btn").addEventListener("click", () => {
  board.tick();
});

document.querySelector("#start-btn").addEventListener("click", () => {
  loop();
});
document.querySelector("#stop-btn").addEventListener("click", () => {
  noLoop();
});
document.querySelector("#reset-btn").addEventListener("click", () => {
  setup();

  board.init();
});
document.querySelector("#male-btn").addEventListener("click", () => {
  pen = "m";
});
document.querySelector("#female-btn").addEventListener("click", () => {
  pen = "f";
});

document.querySelectorAll(".card-outer-border").forEach((elem) => {
  elem.addEventListener("click", function () {
    updatePattern(elem.dataset.type);
  });
});
let fpsSlider = document.querySelector("#fps-slider");
let fpsSliderValue = document.querySelector(".fps-slider-value");
let fps = fpsSlider.value;
fpsSliderValue.innerHTML = fps;
fpsSlider.addEventListener("input", function () {
  fps = fpsSlider.value;
  fpsSliderValue.innerHTML = fps;
});
let items = document.querySelectorAll(".marquee li");
let startTime = Date.now();
updatePattern("default");
function update() {
  if (!board) return;
  let now = Date.now();
  let passedTime = ((now - startTime) / 1000) * 2;
  items.forEach((item, i) => {
    let top = i * 1.5 - passedTime;
    while (top < -1.5) {
      top += items.length * 1.5;
    }
    item.style.top = top + "rem";
    item.querySelector("span").textContent = board.getCount()[i];
  });

  requestAnimationFrame(update);
}
/* control the scrollable div */
const myScrollableDiv = document.querySelector(".cards-panel");
const elements = document.querySelectorAll(".card-outer-border");
const elementHeight = elements[0].offsetHeight;
let scrollPosition = 0;
myScrollableDiv.addEventListener("scroll", function () {
  const maxScrollPosition = (elements.length / 2) * elementHeight;
  if (myScrollableDiv.scrollTop >= maxScrollPosition) {
    scrollPosition -= maxScrollPosition;
    myScrollableDiv.scrollTop = scrollPosition;
  } else if (myScrollableDiv.scrollTop < 0) {
    scrollPosition += maxScrollPosition;
    myScrollableDiv.scrollTop = scrollPosition;
  } else {
    scrollPosition = myScrollableDiv.scrollTop;
  }
});
