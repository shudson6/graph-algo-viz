const gridWidth = 29;
const gridHeight = 29;

const startPointButton = document.getElementById("pickStart-button");
const endPointButton = document.getElementById("pickEnd-button");
const wallButton = document.getElementById("wall-button");
const resetButton = document.getElementById("reset-button");

const runButton = document.getElementById("run-button");
const stepButton = document.getElementById("step-button");

const defaultStartPoint = "24,2";
const defaultEndPoint = "2,20";

const defaultAlgo = BFS;

let startPoint;
let endPoint;

let algorithm;

setSelectedAlgo( defaultAlgo );
// insert algorithm choices
const algoOptions = document.getElementById("algo-options");
algoOptions.insertAdjacentHTML("beforeend", 
    `<div id="algo-bfs" class="button button-unselected">BFS</div>`);
document.getElementById("algo-bfs")
    .addEventListener("click", () => {
      setSelectedAlgo(BFS);
    });

initializeGrid(gridWidth, gridHeight);

setStartPoint(defaultStartPoint);
setEndPoint(defaultEndPoint);

document.getElementById("setup-buttons").addEventListener("click", setupButtonsListener);
runButton.addEventListener("click", runButtonListener);
stepButton.addEventListener("click", stepButtonListener);

/**
 * class used when passing vertex information to search algorithm
 * @param coord should be the id of the associated square
 */
class Vertex {
  constructor(coord, ...neighbors) {
    this.id = coord;
    this.neighbors = neighbors.filter( Boolean );
  }
}

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
  window.location = window.location;
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

function runButtonListener() {
  if ( !algorithm.ready()) {
    algorithm.init(createVertexMap(), startPoint,endPoint);
  }
  algorithm.run(openVertex, closeVertex, tracePath);
}

function stepButtonListener() {
  if ( !algorithm.ready()) {
    algorithm.init(createVertexMap(), startPoint,endPoint);
  }
  algorithm.step(openVertex, closeVertex, tracePath);
}

function createVertexMap() {
  const grid = document.getElementById("grid");
  const vertexes = new Map();
  
  function idOrNull(row, col) {
    const id = coordToId(row, col);
    const node = document.getElementById( id );
    if (node === null || node.classList.contains("square-wall")) {
      return null;
    }
    return id;
  }

  grid.childNodes.forEach(node => {
    if ( !node.classList.contains("square")
        || node.classList.contains("square-wall")
    ) {
      return;
    }
    const [row, col] = idToCoord( node.id );
    const north = idOrNull(row - 1, col);
    const south = idOrNull(row + 1, col);
    const east = idOrNull(row, col - 1);
    const west = idOrNull(row, col + 1);
    vertexes.set(node.id, new Vertex(node.id, north, south, east, west));
  });

  return vertexes;
}

function openVertex(id) {
  if (id === startPoint || id === endPoint) {
    return;
  }
  const node = document.getElementById( id );
  node.classList.add("square-open");
}

function closeVertex(id) {
  if (id === startPoint || id === endPoint) {
    return;
  }
  const node = document.getElementById( id );
  node.classList.remove("square-open");
  node.classList.add("square-closed");
}

function tracePath(vertex) {
  while ( vertex ) {
    if (vertex.id !== startPoint && vertex.id !== endPoint) {
      const node = document.getElementById( vertex.id );
      node.classList.add("square-on-path");
    }
    vertex = vertex.previous;
  }
}

// for debugging
function logVertex(vertex) {
  console.log(`Vertex: ${vertex.id} neighbors: ${vertex.neighbors} `
      + `previous: ${vertex.previous ? vertex.previous.id : "null"}`);
}

function setSelectedAlgo(algo) {
  document.getElementById("algo-picker-button")
    .innerText = `Algo: ${ algo.displayName }`;
  algorithm = algo;
}