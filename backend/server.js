const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Performance optimization: Add route caching
const routeCache = new Map();
const MAX_CACHE_SIZE = 1000;

// Clear cache when it gets too large
function clearOldCache() {
    if (routeCache.size > MAX_CACHE_SIZE) {
        const keys = Array.from(routeCache.keys());
        const keysToDelete = keys.slice(0, Math.floor(MAX_CACHE_SIZE / 2));
        keysToDelete.forEach(key => routeCache.delete(key));
    }
}

// Optimized priority queue implementation using binary heap
class PriorityQueue {
    constructor() {
        this.heap = [];
    }

    push(item, priority) {
        const node = { item, priority };
        this.heap.push(node);
        this.bubbleUp(this.heap.length - 1);
    }

    pop() {
        if (this.heap.length === 0) return null;
        if (this.heap.length === 1) return this.heap.pop();

        const result = this.heap[0];
        this.heap[0] = this.heap.pop();
        this.bubbleDown(0);
        return result;
    }

    bubbleUp(index) {
        while (index > 0) {
            const parentIndex = Math.floor((index - 1) / 2);
            if (this.heap[parentIndex].priority <= this.heap[index].priority) break;
            
            [this.heap[parentIndex], this.heap[index]] = [this.heap[index], this.heap[parentIndex]];
            index = parentIndex;
        }
    }

    bubbleDown(index) {
        while (true) {
            const leftChild = 2 * index + 1;
            const rightChild = 2 * index + 2;
            let smallest = index;

            if (leftChild < this.heap.length && this.heap[leftChild].priority < this.heap[smallest].priority) {
                smallest = leftChild;
            }
            if (rightChild < this.heap.length && this.heap[rightChild].priority < this.heap[smallest].priority) {
                smallest = rightChild;
            }

            if (smallest === index) break;
            
            [this.heap[index], this.heap[smallest]] = [this.heap[smallest], this.heap[index]];
            index = smallest;
        }
    }

    isEmpty() {
        return this.heap.length === 0;
    }
}

const locations = {
    'main-gate': { name: 'Main Gate', x: 400, y: 80 },
    'admin': { name: 'Admin Building', x: 400, y: 200 },
    'library': { name: 'Library', x: 550, y: 200 },
    'connecting-point': { name: 'Connecting Point', x: 400, y: 320 },
    'ac-block-a': { name: 'AC Block A', x: 250, y: 320 },
    'ac-block-b': { name: 'AC Block B', x: 400, y: 480 },
    'ac-block-c': { name: 'AC Block C', x: 550, y: 320 },
    'laundry': { name: 'Laundry', x: 300, y: 620 },
    'food-court': { name: 'Food Court', x: 400, y: 650 },
    'hostel-1': { name: 'Hostel 1', x: 150, y: 750 },
    'sports-arena': { name: 'Sports Arena', x: 400, y: 800 },
    'volleyball-court': { name: 'Volleyball Court', x: 250, y: 920 },
    'cricket-ground': { name: 'Cricket Ground', x: 550, y: 920 }
};

const graph = {
    'main-gate': [{ node: 'admin', distance: 180 }],
    'admin': [
        { node: 'main-gate', distance: 180 },
        { node: 'library', distance: 80 },
        { node: 'connecting-point', distance: 80 }
    ],
    'library': [{ node: 'admin', distance: 80 }],
    'connecting-point': [
        { node: 'admin', distance: 80 },
        { node: 'ac-block-a', distance: 60 },
        { node: 'ac-block-c', distance: 60 },
        { node: 'ac-block-b', distance: 60 }
    ],
    'ac-block-a': [{ node: 'connecting-point', distance: 60 }],
    'ac-block-c': [{ node: 'connecting-point', distance: 60 }],
    'ac-block-b': [
        { node: 'connecting-point', distance: 60 },
        { node: 'food-court', distance: 200 }
    ],
    'laundry': [
        { node: 'food-court', distance: 30 },
        { node: 'hostel-1', distance: 260 }
    ],
    'food-court': [
        { node: 'ac-block-b', distance: 200 },
        { node: 'laundry', distance: 30 },
        { node: 'sports-arena', distance: 280 }
    ],
    'hostel-1': [
        { node: 'laundry', distance: 260 },
        { node: 'sports-arena', distance: 500 }
    ],
    'sports-arena': [
        { node: 'food-court', distance: 280 },
        { node: 'hostel-1', distance: 500 },
        { node: 'volleyball-court', distance: 485 },
        { node: 'cricket-ground', distance: 485 }
    ],
    'volleyball-court': [{ node: 'sports-arena', distance: 485 }],
    'cricket-ground': [{ node: 'sports-arena', distance: 485 }]
};

function heuristic(node1, node2) {
    const loc1 = locations[node1];
    const loc2 = locations[node2];
    if (!loc1 || !loc2) return 0;
    const dx = loc1.x - loc2.x;
    const dy = loc1.y - loc2.y;
    return Math.sqrt(dx * dx + dy * dy);
}

// Optimized A* implementation with Set-based open/closed lists
function aStar(start, end) {
    const openSet = new PriorityQueue();
    const closedSet = new Set();
    const cameFrom = {};
    const gScore = { [start]: 0 };
    const fScore = { [start]: heuristic(start, end) };
    let nodesExplored = 0;
    const startTime = performance.now();

    openSet.push(start, fScore[start]);

    while (!openSet.isEmpty()) {
        const { item: currentNode } = openSet.pop();
        nodesExplored++;

        if (currentNode === end) {
            // Reconstruct path
            const path = [currentNode];
            let current = currentNode;
            while (cameFrom[current]) {
                current = cameFrom[current];
                path.unshift(current);
            }
            const endTime = performance.now();
            return {
                path,
                distance: gScore[end],
                nodesExplored,
                algorithm: "A* Search",
                computationTime: (endTime - startTime).toFixed(3),
                steps: path.length - 1
            };
        }

        closedSet.add(currentNode);

        if (graph[currentNode]) {
            for (const neighbor of graph[currentNode]) {
                const { node: neighborNode, distance: edgeDistance } = neighbor;
                
                if (closedSet.has(neighborNode)) continue;

                const tentativeGScore = gScore[currentNode] + edgeDistance;

                if (!(neighborNode in gScore) || tentativeGScore < gScore[neighborNode]) {
                    cameFrom[neighborNode] = currentNode;
                    gScore[neighborNode] = tentativeGScore;
                    fScore[neighborNode] = tentativeGScore + heuristic(neighborNode, end);
                    
                    openSet.push(neighborNode, fScore[neighborNode]);
                }
            }
        }
    }

    const endTime = performance.now();
    return { 
        path: [], 
        distance: 0, 
        nodesExplored, 
        algorithm: "A* Search",
        computationTime: (endTime - startTime).toFixed(3),
        steps: 0
    };
}

// Add DFS implementation
function dfs(start, end) {
    const stack = [{ node: start, path: [start], distance: 0, visited: new Set([start]) }];
    let nodesExplored = 0;
    const startTime = performance.now();

    while (stack.length > 0) {
        nodesExplored++;
        const { node: currentNode, path, distance, visited } = stack.pop();

        if (currentNode === end) {
            const endTime = performance.now();
            return {
                path,
                distance,
                nodesExplored,
                algorithm: "Depth-First Search",
                computationTime: (endTime - startTime).toFixed(3),
                steps: path.length - 1
            };
        }

        if (graph[currentNode]) {
            for (const neighbor of graph[currentNode]) {
                const { node: neighborNode, distance: edgeDistance } = neighbor;
                
                if (!visited.has(neighborNode)) {
                    const newVisited = new Set(visited);
                    newVisited.add(neighborNode);
                    
                    stack.push({
                        node: neighborNode,
                        path: [...path, neighborNode],
                        distance: distance + edgeDistance,
                        visited: newVisited
                    });
                }
            }
        }
    }

    const endTime = performance.now();
    return {
        path: [],
        distance: 0,
        nodesExplored,
        algorithm: "Depth-First Search",
        computationTime: (endTime - startTime).toFixed(3),
        steps: 0
    };
}

// Optimized Dijkstra implementation with binary heap priority queue
function dijkstra(start, end) {
    const distances = {};
    const previous = {};
    const visited = new Set();
    const pq = new PriorityQueue();
    let nodesExplored = 0;
    const startTime = performance.now();

    // Initialize distances
    for (const node in graph) {
        distances[node] = node === start ? 0 : Infinity;
        previous[node] = null;
    }
    
    pq.push(start, 0);
    
    while (!pq.isEmpty()) {
        const { item: currentNode } = pq.pop();
        
        if (visited.has(currentNode)) continue;
        visited.add(currentNode);
        nodesExplored++;
        
        if (currentNode === end) break;
        
        if (graph[currentNode]) {
            for (const neighbor of graph[currentNode]) {
                const { node: neighborNode, distance: edgeDistance } = neighbor;
                const newDistance = distances[currentNode] + edgeDistance;
                
                if (newDistance < distances[neighborNode]) {
                    distances[neighborNode] = newDistance;
                    previous[neighborNode] = currentNode;
                    pq.push(neighborNode, newDistance);
                }
            }
        }
    }
    
    const endTime = performance.now();
    
    // Reconstruct path
    const path = [];
    let currentNode = end;
    while (currentNode !== null && previous[currentNode] !== undefined) {
        path.unshift(currentNode);
        currentNode = previous[currentNode];
    }
    if (currentNode === start) {
        path.unshift(start);
    }
    
    return {
        path: path.length > 1 && distances[end] !== Infinity ? path : [],
        distance: distances[end] === Infinity ? 0 : distances[end],
        nodesExplored,
        algorithm: "Dijkstra's Algorithm",
        computationTime: (endTime - startTime).toFixed(3),
        steps: path.length > 1 ? path.length - 1 : 0
    };
}

// Optimized BFS implementation
function bfs(start, end) {
    if (start === end) {
        return {
            path: [start],
            distance: 0,
            nodesExplored: 1,
            algorithm: "Breadth-First Search",
            computationTime: "0.001",
            steps: 0
        };
    }

    const queue = [{ node: start, path: [start], distance: 0 }];
    const visited = new Set([start]);
    let nodesExplored = 0;
    const startTime = performance.now();

    while (queue.length > 0) {
        const { node: currentNode, path, distance } = queue.shift();
        nodesExplored++;

        if (currentNode === end) {
            const endTime = performance.now();
            return { 
                path, 
                distance, 
                nodesExplored, 
                algorithm: "Breadth-First Search",
                computationTime: (endTime - startTime).toFixed(3),
                steps: path.length - 1
            };
        }

        if (graph[currentNode]) {
            for (const neighbor of graph[currentNode]) {
                const { node: neighborNode, distance: edgeDistance } = neighbor;

                if (!visited.has(neighborNode)) {
                    visited.add(neighborNode);
                    queue.push({
                        node: neighborNode,
                        path: [...path, neighborNode],
                        distance: distance + edgeDistance
                    });
                }
            }
        }
    }

    const endTime = performance.now();
    return { 
        path: [], 
        distance: 0, 
        nodesExplored, 
        algorithm: "Breadth-First Search",
        computationTime: (endTime - startTime).toFixed(3),
        steps: 0
    };
}

// Optimized DFS implementation with early termination
function dfs(start, end, maxDepth = 10) {
    if (start === end) {
        return {
            path: [start],
            distance: 0,
            nodesExplored: 1,
            algorithm: "Depth-First Search",
            computationTime: "0.001",
            steps: 0
        };
    }

    const startTime = performance.now();
    let nodesExplored = 0;
    let bestPath = null;
    let bestDistance = Infinity;

    function dfsRecursive(currentNode, path, distance, visited) {
        if (path.length > maxDepth) return; // Prevent infinite loops
        
        nodesExplored++;
        
        if (currentNode === end) {
            if (distance < bestDistance) {
                bestDistance = distance;
                bestPath = [...path];
            }
            return;
        }

        if (graph[currentNode]) {
            for (const neighbor of graph[currentNode]) {
                const { node: neighborNode, distance: edgeDistance } = neighbor;
                
                if (!visited.has(neighborNode)) {
                    visited.add(neighborNode);
                    dfsRecursive(
                        neighborNode, 
                        [...path, neighborNode], 
                        distance + edgeDistance,
                        new Set(visited)
                    );
                    visited.delete(neighborNode);
                }
            }
        }
    }

    const visited = new Set([start]);
    dfsRecursive(start, [start], 0, visited);

    const endTime = performance.now();
    return {
        path: bestPath || [],
        distance: bestPath ? bestDistance : 0,
        nodesExplored,
        algorithm: "Depth-First Search",
        computationTime: (endTime - startTime).toFixed(3),
        steps: bestPath ? bestPath.length - 1 : 0
    };
}


// Enhanced algorithm selection logic with performance optimizations
function selectOptimalAlgorithm(start, end, graph, locations) {
    const startLoc = locations[start];
    const endLoc = locations[end];
    
    // Calculate Euclidean distance as heuristic
    const euclideanDistance = Math.sqrt(
        Math.pow(startLoc.x - endLoc.x, 2) + Math.pow(startLoc.y - endLoc.y, 2)
    );
    
    // Count nodes in graph (cached for performance)
    const nodeCount = Object.keys(graph).length;
    
    // Calculate average connectivity (cached for performance)
    const totalEdges = Object.values(graph).reduce((sum, neighbors) => sum + neighbors.length, 0);
    const avgConnectivity = totalEdges / nodeCount;
    
    // Location types
    const locationTypes = {
        'main-gate': 'entrance',
        'admin': 'building',
        'library': 'building', 
        'connecting-point': 'junction',
        'ac-block-a': 'building',
        'ac-block-b': 'building', 
        'ac-block-c': 'building',
        'laundry': 'facility',
        'food-court': 'facility',
        'hostel-1': 'residential',
        'sports-arena': 'sports',
        'volleyball-court': 'sports',
        'cricket-ground': 'sports'
    };
    
    const startType = locationTypes[start] || 'unknown';
    const endType = locationTypes[end] || 'unknown';
    
    // Optimized decision logic for faster algorithm selection
    let selectedAlgorithm = 'astar'; // default
    let reasoning = 'Default selection';
    
    // Quick decisions for common cases
    if (euclideanDistance < 150) {
        selectedAlgorithm = 'bfs';
        reasoning = 'Very short distance - BFS provides instant results';
    }
    else if (euclideanDistance < 350 && avgConnectivity < 2.5) {
        selectedAlgorithm = 'dijkstra';
        reasoning = 'Medium distance with sparse connections - Dijkstra ensures optimality';
    }
    else if (startType === 'sports' && endType === 'sports' && euclideanDistance < 600) {
        selectedAlgorithm = 'dfs';
        reasoning = 'Sports facilities routing - DFS explores alternative paths efficiently';
    }
    else if (start === 'connecting-point' || end === 'connecting-point') {
        selectedAlgorithm = 'dijkstra';
        reasoning = 'Hub routing - Dijkstra explores all connection possibilities';
    }
    else {
        selectedAlgorithm = 'astar';
        reasoning = 'General pathfinding - A* provides optimal balance of speed and accuracy';
    }
    
    return { algorithm: selectedAlgorithm, reasoning, metrics: { euclideanDistance, nodeCount, avgConnectivity } };
}

app.post('/find-path', (req, res) => {
    const { start, end } = req.body;
    
    // Input validation
    if (!start || !end) {
        return res.status(400).json({ error: 'Start and end locations required.' });
    }
    
    if (start === end) {
        return res.status(400).json({ error: 'Start and end locations cannot be the same.' });
    }

    // Check if locations exist
    if (!locations[start] || !locations[end]) {
        return res.status(400).json({ error: 'Invalid start or end location.' });
    }

    // Check cache first
    const cacheKey = `${start}-${end}`;
    if (routeCache.has(cacheKey)) {
        const cachedResult = routeCache.get(cacheKey);
        cachedResult.cached = true;
        cachedResult.executionTime = 0; // Cached results are instant
        return res.json(cachedResult);
    }

    try {
        // Automatically select optimal algorithm
        const algorithmSelection = selectOptimalAlgorithm(start, end, graph, locations);
        const selectedAlgorithm = algorithmSelection.algorithm;
        
        let result;
        const startTime = Date.now();
        
        // Execute selected algorithm with timeout protection
        const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Algorithm timeout')), 5000)
        );
        
        const algorithmPromise = new Promise((resolve) => {
            switch (selectedAlgorithm) {
                case 'dijkstra':
                    resolve(dijkstra(start, end));
                    break;
                case 'astar':
                    resolve(aStar(start, end));
                    break;
                case 'bfs':
                    resolve(bfs(start, end));
                    break;
                case 'dfs':
                    resolve(dfs(start, end));
                    break;
                default:
                    resolve(aStar(start, end)); // fallback
            }
        });
        
        Promise.race([algorithmPromise, timeoutPromise])
            .then(result => {
                const executionTime = Date.now() - startTime;
                
                // If primary algorithm fails, try A* as fallback
                if (!result || result.path.length === 0) {
                    result = aStar(start, end);
                    result.algorithm = 'A* Search (Fallback)';
                    result.reasoning = 'Primary algorithm failed - used A* as fallback';
                } else {
                    result.reasoning = algorithmSelection.reasoning;
                    result.selectedMetrics = algorithmSelection.metrics;
                }
                
                result.executionTime = executionTime;
                result.cached = false;
                
                // Cache successful results
                if (result.path.length > 0) {
                    clearOldCache();
                    routeCache.set(cacheKey, { ...result });
                    // Also cache reverse route
                    const reverseResult = { ...result };
                    reverseResult.path = [...result.path].reverse();
                    routeCache.set(`${end}-${start}`, reverseResult);
                }
                
                res.json(result);
            })
            .catch(error => {
                console.error('Pathfinding error:', error);
                // Fallback to A* on timeout or error
                const result = aStar(start, end);
                result.algorithm = 'A* Search (Fallback)';
                result.reasoning = 'Algorithm timeout - used A* as fallback';
                result.executionTime = Date.now() - startTime;
                res.json(result);
            });
            
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ error: 'Internal server error during pathfinding.' });
    }
});

app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
});
