class Dijkstra extends BFS {
  constructor(vertexMap, startId, endId) {
    super(vertexMap, startId, endId);
    this.queue[0].pathCost = 0;
  }

  nextVertex() {
    return this.queue.pop();
  }

  needToVisit(neighbor, current) {
    return !neighbor.visited
        || (this.pathCost(neighbor, current) < neighbor.pathCost);
  }

  visit(neighbor, current) {
    super.visit(neighbor, current);
    neighbor.pathCost = this.pathCost(neighbor, current);
    this.queue.sort((a, b) => b.pathCost - a.pathCost);
  }

  pathCost(neighbor, current) {
    return current.pathCost + neighbor.cost;
  }
}