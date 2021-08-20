const Dijkstra = (() => {
  const displayName = "Dijkstra";
  let startPointId, endPointId;
  let vertexes;
  const queue = [];
  let initialized = false;

  function ready() {
    return initialized;
  }

  function init(vertexMap, startId, endId) {
    vertexes = vertexMap;
    startPointId = startId;
    endPointId = endId;
    vertexes.forEach(v => {
      v.visited = false;
    });
    const startVertex = vertexes.get( startPointId );
    startVertex.previous = null;
    startVertex.visited = true;
    startVertex.pathCost = 0;
    queue.push( startVertex );
    initialized = true;
  }

  function run(vertexOpened, vertexClosed, pathFound) {
    if (queue.length > 0) {
      setTimeout(() => {
        step(vertexOpened, vertexClosed, pathFound);
        run(vertexOpened, vertexClosed, pathFound);
      }, 20);
    }
  }

  function step(vertexOpened, vertexClosed, pathFound) {
    const current = queue.pop();
    vertexClosed( current.id );
    for (const neighborId of current.neighbors) {
      const nvx = vertexes.get( neighborId );
      pcost = current.pathCost + nvx.cost;
      if ( !nvx.visited || pcost < nvx.pathCost) {
        vertexOpened( nvx.id );
        nvx.visited = true;
        nvx.previous = current;
        nvx.pathCost = pcost;
        queue.push( nvx );
        queue.sort((a, b) => b.pathCost - a.pathCost);
      }
      if (neighborId === endPoint) {
        console.log("Success!");
        pathFound( nvx );
        queue.length = 0;
        return;
      }
    }
  }

  return {
    displayName
    ,ready
    ,init
    ,run
    ,step
  }
})();