// pathWorker.js
self.onmessage = function(e) {
    const { graph, locations, start, end, algorithm } = e.data;

    function dijkstra(start, end) {
        const distances = {};
        const previous = {};
        const visited = new Set();
        const priorityQueue = [];
        for (const node in graph) {
            distances[node] = node === start ? 0 : Infinity;
            previous[node] = null;
        }
        priorityQueue.push({ node: start, distance: 0 });
        while (priorityQueue.length > 0) {
            priorityQueue.sort((a, b) => a.distance - b.distance);
            const { node: currentNode } = priorityQueue.shift();
            if (visited.has(currentNode)) continue;
            visited.add(currentNode);
            if (currentNode === end) break;
            if (graph[currentNode]) {
                for (const neighbor of graph[currentNode]) {
                    const { node: neighborNode, distance: edgeDistance } = neighbor;
                    const newDistance = distances[currentNode] + edgeDistance;
                    if (newDistance < distances[neighborNode]) {
                        distances[neighborNode] = newDistance;
                        previous[neighborNode] = currentNode;
                        priorityQueue.push({ node: neighborNode, distance: newDistance });
                    }
                }
            }
        }
        const path = [];
        let currentNode = end;
        while (currentNode !== null) {
            path.unshift(currentNode);
            currentNode = previous[currentNode];
        }
        return {
            path: path.length > 1 ? path : [],
            distance: distances[end] === Infinity ? 0 : distances[end]
        };
    }

    function heuristic(node1, node2) {
        const loc1 = locations[node1];
        const loc2 = locations[node2];
        if (!loc1 || !loc2) return 0;
        const dx = loc1.x - loc2.x;
        const dy = loc1.y - loc2.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    function aStar(start, end) {
        const openSet = [start];
        const closedSet = new Set();
        const cameFrom = {};
        const gScore = { [start]: 0 };
        const fScore = { [start]: heuristic(start, end) };
        while (openSet.length > 0) {
            let currentNode = openSet.reduce((min, node) => (fScore[node] || Infinity) < (fScore[min] || Infinity) ? node : min);
            if (currentNode === end) {
                const path = [currentNode];
                while (cameFrom[currentNode]) {
                    currentNode = cameFrom[currentNode];
                    path.unshift(currentNode);
                }
                return { path, distance: gScore[end] };
            }
            openSet.splice(openSet.indexOf(currentNode), 1);
            closedSet.add(currentNode);
            if (graph[currentNode]) {
                for (const neighbor of graph[currentNode]) {
                    const { node: neighborNode, distance: edgeDistance } = neighbor;
                    if (closedSet.has(neighborNode)) continue;
                    const tentativeGScore = gScore[currentNode] + edgeDistance;
                    if (tentativeGScore < (gScore[neighborNode] || Infinity)) {
                        cameFrom[neighborNode] = currentNode;
                        gScore[neighborNode] = tentativeGScore;
                        fScore[neighborNode] = tentativeGScore + heuristic(neighborNode, end);
                        if (!openSet.includes(neighborNode)) {
                            openSet.push(neighborNode);
                        }
                    }
                }
            }
        }
        return { path: [], distance: 0 };
    }

    function bfs(start, end) {
        const queue = [{ node: start, path: [start], distance: 0 }];
        const visited = new Set([start]);
        while (queue.length > 0) {
            const { node: currentNode, path, distance } = queue.shift();
            if (currentNode === end) {
                return { path, distance };
            }
            if (graph[currentNode]) {
                for (const neighbor of graph[currentNode]) {
                    const { node: neighborNode, distance: edgeDistance } = neighbor;
                    if (!visited.has(neighborNode)) {
                        visited.add(neighborNode);
                        queue.push({ node: neighborNode, path: [...path, neighborNode], distance: distance + edgeDistance });
                    }
                }
            }
        }
        return { path: [], distance: 0 };
    }

    function dfs(start, end) {
        const stack = [{ node: start, path: [start], distance: 0, visited: new Set([start]) }];
        while (stack.length > 0) {
            const { node: currentNode, path, distance, visited } = stack.pop();
            if (currentNode === end) {
                return { path, distance };
            }
            if (graph[currentNode]) {
                for (const neighbor of graph[currentNode]) {
                    const { node: neighborNode, distance: edgeDistance } = neighbor;
                    if (!visited.has(neighborNode)) {
                        const newVisited = new Set(visited);
                        newVisited.add(neighborNode);
                        stack.push({ node: neighborNode, path: [...path, neighborNode], distance: distance + edgeDistance, visited: newVisited });
                    }
                }
            }
        }
        return { path: [], distance: 0 };
    }

    let result;
    switch (algorithm) {
        case 'dijkstra':
            result = dijkstra(start, end);
            break;
        case 'astar':
            result = aStar(start, end);
            break;
        case 'bfs':
            result = bfs(start, end);
            break;
        case 'dfs':
            result = dfs(start, end);
            break;
        default:
            result = dijkstra(start, end);
    }
    self.postMessage(result);
};
