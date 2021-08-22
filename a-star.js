class Astar extends Dijkstra {
  constructor(vertexMap, startId, endId) {
    super(vertexMap, startId, endId);
  }

  nextVertex() {
    this.queue.sort((a, b) => b.totalCost - a.totalCost);
    return this.queue.pop();
  }

  needToVisit(neighbor, current) {
    return !neighbor.visited;
  }

  visit(neighbor, current) {
    super.visit(neighbor, current);
    neighbor.totalCost = neighbor.pathCost + this.manhattanCost(neighbor);
  }

  manhattanCost(vertex) {
    const [endX, endY] = idToCoord(this.endId);
    const [curX, curY] = idToCoord(vertex.id);
    return Math.abs(endX - curX) + Math.abs(endY - curY);
  }
}