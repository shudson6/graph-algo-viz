class BFS {
  constructor(vertexMap, startId, endId) {
    this.queue = [];
    this.vertexMap = vertexMap;
    this.startId = startId;
    this.endId = endId;
    for (const v of this.vertexMap) {
      v.visited = false;
    }
    const startVertex = this.vertexMap.get( this.startId );
    startVertex.previous = null;
    startVertex.visited = true;
    this.queue.push( startVertex );
  }

  run(vertexOpened, vertexClosed, pathFound) {
    if (this.queue.length > 0) {
      setTimeout(() => {
        this.step(vertexOpened, vertexClosed, pathFound);
        this.run(vertexOpened, vertexClosed, pathFound);
      }, 20);
    }
  }

  step(vertexOpened, vertexClosed, pathFound) {
    const current = this.nextVertex();
    vertexClosed( current.id );
    for (const neighborId of current.neighbors) {
      const nvx = this.vertexMap.get( neighborId );
      if ( this.needToVisit( nvx, current )) {
        vertexOpened( nvx.id );
        this.visit(nvx, current);
      }
      if (neighborId === this.endId) {
        console.log("Success!");
        pathFound( nvx );
        this.queue.length = 0;
        return;
      }
    }
  }

  nextVertex() {
    return this.queue.shift();
  }

  needToVisit(neighbor, current) {
    return !neighbor.visited;
  }

  visit(neighbor, current) {
      neighbor.visited = true;
      neighbor.previous = current;
      this.queue.push( neighbor );
  }
}