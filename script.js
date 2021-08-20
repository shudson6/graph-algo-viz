const gridWidth = 31;
const gridHeight = 31;

const grid = document.getElementById("grid");

const startPointButton = document.getElementById("pickStart-button");
const endPointButton = document.getElementById("pickEnd-button");
const wallButton = document.getElementById("wall-button");
const dirtButton = document.getElementById("drawDirt-button");
const roadButton = document.getElementById("drawRoad-button");
const resetButton = document.getElementById("reset-button");

const runButton = document.getElementById("run-button");
const stepButton = document.getElementById("step-button");

const defaultStartPoint = "24,2";
const defaultEndPoint = "2,20";

const defaultAlgo = BFS;

let startPoint;
let endPoint;

let algorithm;

let impediment;

setSelectedAlgo( defaultAlgo );
// insert algorithm choices
addAlgoOption( BFS );
addAlgoOption( Dijkstra );

function addAlgoOption(algo) {
  const algoOptions = document.getElementById("algo-options");
  const id = `algo-${ algo.displayName.toLowerCase() }`;
  algoOptions.insertAdjacentHTML("beforeend", 
      `<div id="${ id }" class="button button-unselected">`
      + `${ algo.displayName }</div>`);
  document.getElementById( id )
      .addEventListener("click", () => {
        setSelectedAlgo( algo );
      });
}

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
  const node = document.getElementById(startPoint);
  node.className = "square";
  node.classList.add("square-start");
}

function setEndPoint(coord) {
  if (endPoint) {
    document.getElementById(endPoint).classList.remove("square-end");
  }
  endPoint = coord;
  const node = document.getElementById(endPoint);
  node.className = "square";
  node.classList.add("square-end");
}

function clickedNewStartPoint(event) {
  if (isValidDrawTarget(event.target)) {
    setStartPoint(event.target.id);
  }
}

function clickedNewEndPoint(event) {
  if (isValidDrawTarget(event.target)) {
    setEndPoint(event.target.id);
  }
}

function isValidDrawTarget(target) {
  return target.classList.contains("square")
      && !target.classList.contains("square-end")
      && !target.classList.contains("square-start")
}

function startDrawing(event) {
  if ( event.buttons === 1 && isValidDrawTarget(event.target)) {
    grid.addEventListener("mousemove", drawWall);
    grid.addEventListener("mouseup", endDrawing);
    grid.addEventListener("mouseleave", endDrawing);

    drawWall( event );
  }
}

function drawWall(event) {
  if ( event.buttons === 1 && isValidDrawTarget(event.target)) {
    event.target.className = "square";
    event.target.classList.add( impediment );
  }
}

function endDrawing(event) {
  grid.removeEventListener("mousemove", drawWall);
  grid.removeEventListener("mouseup", endDrawing);
  grid.removeEventListener("mouseleave", endDrawing);

  drawWall( event );
}

function resetGrid() {
  window.location = window.location;
}

function setupButtonsListener(event) {
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
  for (const button of [ wallButton, dirtButton, roadButton ]) {
    if (event.target !== button) {
      button.classList.remove("button-selected");
      button.classList.add("button-unselected");
      grid.removeEventListener("mousedown", startDrawing);
    }
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
    impediment = "square-wall";
    grid.addEventListener("mousedown", startDrawing);
  }
  if (event.target === dirtButton) {
    impediment = "square-dirt";
    grid.addEventListener("mousedown", startDrawing);
  }
  if (event.target === roadButton) {
    impediment = "square-water";
    grid.addEventListener("mousedown", startDrawing);
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
    
    const vert = new Vertex(node.id, north, south, east, west);
    vert.cost = costOf( node );
    vertexes.set(node.id, vert);
  });

  return vertexes;
}

function costOf(square) {
  if (square.classList.contains("square-dirt")) {
    return 3;
  }
  if (square.classList.contains("square-water")) {
    return 7;
  }
  if (square.classList.contains("square-wall")) {
    return Infinity;
  }
  if ( square.classList.contains("square-end")
    || square.classList.contains("square-start")
  ) {
    return 0;
  }
  // default is just asphalt
  return 1;
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