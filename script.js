const gridWidth = 31;
const gridHeight = 31;

const grid = document.getElementById("grid");

const bfsButton = document.getElementById("algo-bfs");
const dijkstraButton = document.getElementById("algo-dijkstra");
const astarButton = document.getElementById("algo-a-star");
const startPointButton = document.getElementById("pickStart-button");
const endPointButton = document.getElementById("pickEnd-button");
const wallButton = document.getElementById("wall-button");
const roadButton = document.getElementById("drawRoad-button");
const dirtButton = document.getElementById("drawDirt-button");
const waterButton = document.getElementById("drawWater-button");
const runButton = document.getElementById("run-button");
const resetButton = document.getElementById("reset-button");

const algoButtons = [ bfsButton, dijkstraButton, astarButton ];
const drawButtons = [ startPointButton
                      ,endPointButton
                      ,roadButton
                      ,dirtButton
                      ,waterButton
                      ,wallButton
                    ];
for (const button of drawButtons) {
  button.addEventListener("click", drawingButtonsListener);
}

const defaultStartPoint = "24,2";
const defaultEndPoint = "2,20";

let startPoint;
let endPoint;

let impediment;

initializeGrid(gridWidth, gridHeight);

setStartPoint(defaultStartPoint);
setEndPoint(defaultEndPoint);

runButton.addEventListener("click", runButtonListener);

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

function selectButton(button) {
  button.classList.remove("button-unselected");
  button.classList.add("button-selected");
}

function deselectButton(button) {
  button.classList.remove("button-selected");
  button.classList.add("button-unselected");
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

function drawingButtonsListener(event) {
  for (const btn of drawButtons.filter(b => b !== event.target)) {
    deselectButton( btn );
    if (btn !== startPointButton) {
      grid.removeEventListener("click", clickedNewStartPoint);
    }
    else if (btn !== endPointButton) {
      grid.removeEventListener("click", clickedNewEndPoint);
    }
    else {
      grid.removeEventListener("mousedown", startDrawing);
    }
  }

  selectButton( event.target );

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
  if (event.target === waterButton) {
    impediment = "square-water";
    grid.addEventListener("mousedown", startDrawing);
  }
  if (event.target === roadButton) {
    impediment = "square";
    grid.addEventListener("mousedown", startDrawing);
  }
}

function runButtonListener() {
  if ( !algorithm.ready()) {
    algorithm.init(createVertexMap(), startPoint,endPoint);
  }
  algorithm.run(openVertex, closeVertex, tracePath);
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