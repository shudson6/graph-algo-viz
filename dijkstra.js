/**
 * Implements Dijkstra's Algorithm. Its 'priority queue' is just an array
 * that is constantly sorted descending and accessed from the rear. Not 
 * exactly efficient, but it works and keeps me from writing a PQ :)
 */
class Dijkstra extends BFS {
  constructor(vertexMap, startId, endId) {
    super(vertexMap, startId, endId);
    this.queue[0].pathCost = 0;
  }

  nextVertex() {
    this.queue.sort((a, b) => b.pathCost - a.pathCost);
    return this.queue.pop();
  }

  needToVisit(neighbor, current) {
    return !neighbor.visited
        || (this.pathCost(neighbor, current) < neighbor.pathCost);
  }

  visit(neighbor, current) {
    super.visit(neighbor, current);
    neighbor.pathCost = this.pathCost(neighbor, current);
  }

  pathCost(neighbor, current) {
    return current.pathCost + neighbor.cost;
  }
}