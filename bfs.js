const BFS = (() => {
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
    for (let [k, v] of vertexes) {
      console.log(`${k}: ${v.neighbors}`);
      v.visited = false;
    }
    const startVertex = vertexes.get( startPointId );
    startVertex.previous = null;
    startVertex.visited = true;
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
    const current = queue.shift();
    vertexClosed( current.id );
    for (const neighborId of current.neighbors) {
      const nvx = vertexes.get( neighborId );
      if ( !nvx.visited ) {
        vertexOpened( nvx.id );
        nvx.visited = true;
        nvx.previous = current;
        queue.push( nvx );
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
    init
    ,run
    ,step
    ,ready
  };
})();