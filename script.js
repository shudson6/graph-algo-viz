const gridWidth = 23;
const gridHeight = 27;

const startPointButton = document.getElementById("pickStart-button");
const endPointButton = document.getElementById("pickEnd-button");
const wallButton = document.getElementById("wall-button");
const resetButton = document.getElementById("reset-button");

const defaultStartPoint = "24,2";
const defaultEndPoint = "2,20";

let startPoint;
let endPoint;

initializeGrid(gridWidth, gridHeight);

setStartPoint(defaultStartPoint);
setEndPoint(defaultEndPoint);

document.getElementById("setup-buttons").addEventListener("click", setupButtonsListener);

////////////////////////////////////////
// functions
////////////////////////////////////////
function coordToId(row, col) {
  return `${row},${col}`;
}

function idToCoord(id) {
  const coords = id.slice().split(',');
  return [ +coords[0], +coords[1] ];
}

function initializeGrid(width, height) {
  const grid = document.getElementById("grid");
  for (let row = 0; row < height; row++) {
    for (let col = 0; col < width; col++) {
      const square = `<div class="square" id="${ coordToId( row, col )}"></div>`;
      grid.insertAdjacentHTML("beforeEnd", square);
    }
  }
  // don't return til the last square is found in the DOM
  while (document.getElementById(coordToId(gridHeight - 1, gridWidth - 1)) === null);
}

function setStartPoint(coord) {
  if (startPoint) {
    document.getElementById(startPoint).classList.remove("square-start");
  }
  startPoint = coord;
  document.getElementById(startPoint).classList.add("square-start");
}

function setEndPoint(coord) {
  if (endPoint) {
    document.getElementById(endPoint).classList.remove("square-end");
  }
  endPoint = coord;
  document.getElementById(endPoint).classList.add("square-end");
}

function clickedNewStartPoint(event) {
  if (event.target.classList.contains("square")
    && !event.target.classList.contains("square-end")
    && !event.target.classList.contains("square-start")
  ) {
    setStartPoint(event.target.id);
  }
}

function clickedNewEndPoint(event) {
  if (event.target.classList.contains("square")
    && !event.target.classList.contains("square-end")
    && !event.target.classList.contains("square-start")
  ) {
    setEndPoint(event.target.id);
  }
}

function clickedNewWallPoint(event) {
  if (event.target.classList.contains("square")
    && !event.target.classList.contains("square-end")
    && !event.target.classList.contains("square-start")
  ) {
    event.target.classList.add("square-wall");
  }
}

function resetGrid() {
  const grid = document.getElementById("grid");
  grid.childNodes.forEach((el) => {
    if (el.classList.contains("square")) {
      el.className = "square";
    }
  });
  setStartPoint( defaultStartPoint );
  setEndPoint( defaultEndPoint );
}

function setupButtonsListener(event) {
  const grid = document.getElementById("grid");

  // clear buttons that weren't clicked
  if (event.target !== startPointButton) {
    startPointButton.classList.remove("button-selected");
    startPointButton.classList.add("button-unselected");
    grid.removeEventListener("click", clickedNewStartPoint);
  }
  if (event.target !== endPointButton) {
    endPointButton.classList.remove("button-selected");
    endPointButton.classList.add("button-unselected");
    grid.removeEventListener("click", clickedNewEndPoint);
  }
  if (event.target !== wallButton) {
    wallButton.classList.remove("button-selected");
    wallButton.classList.add("button-unselected");
    grid.removeEventListener("click", clickedNewWallPoint);
  }

  // action for clear button returns b/c it never needs to look selected
  if (event.target === resetButton) {
    resetGrid();
    return;
  }

  event.target.classList.remove("button-unselected");
  event.target.classList.add("button-selected");

  if (event.target === startPointButton) {
    grid.addEventListener("click", clickedNewStartPoint);
  }
  if (event.target === endPointButton) {
    grid.addEventListener("click", clickedNewEndPoint);
  }
  if (event.target === wallButton) {
    grid.addEventListener("click", clickedNewWallPoint);
  }
}