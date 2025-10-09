    // ...existing code...
    // Add a property to hold the worker instance
    pathWorker = null;
class CampusNavigator {
    constructor() {
        this.graph = {};
        this.locations = {};
        this.currentPath = [];
        this.initializeGraph();
        this.initializeEventListeners();
    }

    initializeGraph() {
        // Define locations with coordinates for heuristic calculations
        this.locations = {
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

        // Initialize graph with connections based on the campus map
        this.graph = {
            'main-gate': [
                { node: 'admin', distance: 180 }
            ],
            'admin': [
                { node: 'main-gate', distance: 180 },
                { node: 'library', distance: 80 },
                { node: 'connecting-point', distance: 80 }
            ],
            'library': [
                { node: 'admin', distance: 80 }
            ],
            'connecting-point': [
                { node: 'admin', distance: 80 },
                { node: 'ac-block-a', distance: 60 },
                { node: 'ac-block-c', distance: 60 },
                { node: 'ac-block-b', distance: 60 }
            ],
            'ac-block-a': [
                { node: 'connecting-point', distance: 60 }
            ],
            'ac-block-c': [
                { node: 'connecting-point', distance: 60 }
            ],
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
            'volleyball-court': [
                { node: 'sports-arena', distance: 485 }
            ],
            'cricket-ground': [
                { node: 'sports-arena', distance: 485 }
            ]
        };
    }

    initializeEventListeners() {
        const findPathBtn = document.getElementById('findPathBtn');
        const clearPathBtn = document.getElementById('clearPathBtn');
        const startSelect = document.getElementById('startLocation');
        const endSelect = document.getElementById('endLocation');

        findPathBtn.addEventListener('click', () => this.findPath());
        clearPathBtn.addEventListener('click', () => this.clearPath());
        
        // Add visual feedback for location selection
        startSelect.addEventListener('change', () => this.updateLocationHighlight());
        endSelect.addEventListener('change', () => this.updateLocationHighlight());

        // Add hover effects for nodes
        this.initializeNodeHoverEffects();
    }

    initializeNodeHoverEffects() {
        const nodes = document.querySelectorAll('.node');
        nodes.forEach(node => {
            const location = node.getAttribute('data-location');
            if (location && this.locations[location]) {
                node.addEventListener('mouseenter', (e) => {
                    this.showLocationTooltip(e, location);
                });
                node.addEventListener('mouseleave', () => {
                    this.hideLocationTooltip();
                });
            }
        });
    }

    showLocationTooltip(event, location) {
        const locationData = this.locations[location];
        const tooltip = document.createElement('div');
        tooltip.id = 'location-tooltip';
        tooltip.className = 'location-tooltip';
        
        const descriptions = {
            'main-gate': 'Primary entrance to the campus with security checkpoint',
            'admin': 'Administrative offices and student services',
            'library': 'Central library with study areas and computer lab',
            'ac-block-a': 'Academic building with lecture halls and classrooms',
            'ac-block-b': 'Academic building with laboratories and faculty offices',
            'ac-block-c': 'Academic building with conference rooms and auditorium',
            'connecting-point': 'Central hub connecting different campus areas',
            'laundry': 'Student laundry facility with washing and drying services',
            'food-court': 'Main dining area with multiple food outlets',
            'hostel-1': 'Student residential building with dormitory rooms',
            'sports-arena': 'Multi-purpose sports complex with indoor facilities',
            'volleyball-court': 'Outdoor volleyball court for recreational play',
            'cricket-ground': 'Cricket field for matches and practice sessions'
        };

        tooltip.innerHTML = `
            <div class="tooltip-header">
                <span class="tooltip-icon">${this.getLocationIcon(location)}</span>
                <span class="tooltip-name">${locationData.name}</span>
            </div>
            <div class="tooltip-description">
                ${descriptions[location] || 'Campus location'}
            </div>
            <div class="tooltip-coordinates">
                Coordinates: (${locationData.x}, ${locationData.y})
            </div>
        `;

        document.body.appendChild(tooltip);

        // Position tooltip
        const rect = event.target.getBoundingClientRect();
        tooltip.style.left = `${rect.right + 10}px`;
        tooltip.style.top = `${rect.top}px`;
    }

    hideLocationTooltip() {
        const tooltip = document.getElementById('location-tooltip');
        if (tooltip) {
            tooltip.remove();
        }
    }

    getLocationIcon(location) {
        const icons = {
            'main-gate': '🚪',
            'admin': '🏢',
            'library': '📚',
            'ac-block-a': '🏫',
            'ac-block-b': '🏫',
            'ac-block-c': '🏫',
            'connecting-point': '🔗',
            'laundry': '🧺',
            'food-court': '🍽️',
            'hostel-1': '🏠',
            'sports-arena': '🏟️',
            'volleyball-court': '🏐',
            'cricket-ground': '🏏'
        };
        return icons[location] || '📍';
    }

    updateLocationHighlight() {
        const startLocation = document.getElementById('startLocation').value;
        const endLocation = document.getElementById('endLocation').value;

        // Clear all highlights
        document.querySelectorAll('.node').forEach(node => {
            node.classList.remove('start', 'end', 'selected');
        });

        // Highlight start location
        if (startLocation) {
            const startNode = document.getElementById(`node-${startLocation}`);
            if (startNode) startNode.classList.add('start');
        }

        // Highlight end location
        if (endLocation) {
            const endNode = document.getElementById(`node-${endLocation}`);
            if (endNode) endNode.classList.add('end');
        }
    }

    async findPath() {
        const startLocation = document.getElementById('startLocation').value;
        const endLocation = document.getElementById('endLocation').value;
        const findPathBtn = document.getElementById('findPathBtn');

        if (!startLocation || !endLocation) {
            this.showNotification('Please select both start and end locations.', 'warning');
            return;
        }

        if (startLocation === endLocation) {
            this.showNotification('Start and end locations cannot be the same.', 'warning');
            return;
        }

        // Show enhanced loading state
        findPathBtn.disabled = true;
        findPathBtn.innerHTML = `
            <div class="loading-container">
                <div class="loading-spinner"></div>
                <span>Finding Optimal Route...</span>
            </div>
        `;

        // Add loading overlay to results panel
        this.showLoadingState();

        const startTime = performance.now();

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

            const response = await fetch('http://localhost:3001/find-path', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    start: startLocation,
                    end: endLocation
                }),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`Server error: ${response.status}`);
            }

            const result = await response.json();
            const clientExecutionTime = (performance.now() - startTime).toFixed(2);

            if (result.path && result.path.length > 0) {
                this.displayPath(result.path);
                this.showResults({
                    ...result,
                    clientExecutionTime: clientExecutionTime
                });
                
                const cacheStatus = result.cached ? ' (Cached)' : '';
                this.showNotification(`Route found in ${clientExecutionTime}ms${cacheStatus}!`, 'success');
            } else {
                this.showNotification('No path found between the selected locations.', 'error');
            }

        } catch (error) {
            const clientExecutionTime = (performance.now() - startTime).toFixed(2);
            
            if (error.name === 'AbortError') {
                this.showNotification('Request timed out. Please try again.', 'error');
            } else if (error.message.includes('Failed to fetch')) {
                this.showNotification('Unable to connect to the server. Please ensure the backend is running on port 3001.', 'error');
            } else {
                console.error('Error finding path:', error);
                this.showNotification(`Error: ${error.message}`, 'error');
            }
        } finally {
            // Reset button state
            this.hideLoadingState();
            findPathBtn.disabled = false;
            findPathBtn.innerHTML = '<span class="btn-icon">🧭</span> Find Optimal Route';
        }
    }

    showLoadingState() {
        const resultsPanel = document.getElementById('pathResults');
        resultsPanel.classList.remove('hidden');
        resultsPanel.innerHTML = `
            <div class="loading-results">
                <div class="loading-spinner large"></div>
                <h3>🤖 AI is analyzing your route...</h3>
                <p>Evaluating algorithms and finding the optimal path</p>
                <div class="loading-steps">
                    <div class="loading-step active">📊 Analyzing route characteristics</div>
                    <div class="loading-step">🧠 Selecting optimal algorithm</div>
                    <div class="loading-step">🚀 Computing fastest path</div>
                </div>
            </div>
        `;

        // Animate loading steps
        setTimeout(() => {
            const steps = document.querySelectorAll('.loading-step');
            steps.forEach((step, index) => {
                setTimeout(() => {
                    step.classList.add('active');
                }, index * 800);
            });
        }, 500);
    }

    hideLoadingState() {
        // Loading state will be replaced by results or hidden
    }

    showNotification(message, type = 'info') {
        // Remove any existing notifications
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };

        notification.innerHTML = `
            <span class="notification-icon">${icons[type] || icons.info}</span>
            <span class="notification-message">${message}</span>
            <button class="notification-close">×</button>
        `;

        document.body.appendChild(notification);

        // Add click handler for close button
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.remove();
        });

        // Auto-hide after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.classList.add('fade-out');
                setTimeout(() => notification.remove(), 300);
            }
        }, 5000);
    }

    dijkstra(start, end) {
        const distances = {};
        const previous = {};
        const visited = new Set();
        const priorityQueue = [];

        // Initialize distances
        for (const node in this.graph) {
            distances[node] = node === start ? 0 : Infinity;
            previous[node] = null;
        }

        priorityQueue.push({ node: start, distance: 0 });

        while (priorityQueue.length > 0) {
            // Sort by distance (simple priority queue implementation)
            priorityQueue.sort((a, b) => a.distance - b.distance);
            const { node: currentNode } = priorityQueue.shift();

            if (visited.has(currentNode)) continue;
            visited.add(currentNode);

            if (currentNode === end) break;

            if (this.graph[currentNode]) {
                for (const neighbor of this.graph[currentNode]) {
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

        // Reconstruct path
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

    aStar(start, end) {
        const openSet = [start];
        const cameFrom = {};
        const gScore = { [start]: 0 };
        const fScore = { [start]: this.heuristic(start, end) };

        while (openSet.length > 0) {
            // Find node with lowest fScore
            let currentNode = openSet.reduce((min, node) => 
                (fScore[node] || Infinity) < (fScore[min] || Infinity) ? node : min
            );

            if (currentNode === end) {
                // Reconstruct path
                const path = [currentNode];
                while (cameFrom[currentNode]) {
                    currentNode = cameFrom[currentNode];
                    path.unshift(currentNode);
                }
                return {
                    path,
                    distance: gScore[end]
                };
            }

            openSet.splice(openSet.indexOf(currentNode), 1);

            if (this.graph[currentNode]) {
                for (const neighbor of this.graph[currentNode]) {
                    const { node: neighborNode, distance: edgeDistance } = neighbor;
                    const tentativeGScore = gScore[currentNode] + edgeDistance;

                    if (tentativeGScore < (gScore[neighborNode] || Infinity)) {
                        cameFrom[neighborNode] = currentNode;
                        gScore[neighborNode] = tentativeGScore;
                        fScore[neighborNode] = tentativeGScore + this.heuristic(neighborNode, end);

                        if (!openSet.includes(neighborNode)) {
                            openSet.push(neighborNode);
                        }
                    }
                }
            }
        }

        return { path: [], distance: 0 };
    }

    bfs(start, end) {
        const queue = [{ node: start, path: [start], distance: 0 }];
        const visited = new Set([start]);

        while (queue.length > 0) {
            const { node: currentNode, path, distance } = queue.shift();

            if (currentNode === end) {
                return { path, distance };
            }

            if (this.graph[currentNode]) {
                for (const neighbor of this.graph[currentNode]) {
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

        return { path: [], distance: 0 };
    }

    dfs(start, end) {
        const stack = [{ node: start, path: [start], distance: 0, visited: new Set([start]) }];

        while (stack.length > 0) {
            const { node: currentNode, path, distance, visited } = stack.pop();

            if (currentNode === end) {
                return { path, distance };
            }

            if (this.graph[currentNode]) {
                for (const neighbor of this.graph[currentNode]) {
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

        return { path: [], distance: 0 };
    }

    heuristic(node1, node2) {
        // Euclidean distance between two points
        const loc1 = this.locations[node1];
        const loc2 = this.locations[node2];
        
        if (!loc1 || !loc2) return 0;
        
        const dx = loc1.x - loc2.x;
        const dy = loc1.y - loc2.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    displayPath(path) {
        // Clear previous path highlighting
        this.clearPath();
        
        // Store current path
        this.currentPath = path;

        // Highlight path edges
        for (let i = 0; i < path.length - 1; i++) {
            const from = path[i];
            const to = path[i + 1];
            this.highlightEdge(from, to);
        }

        // Highlight path nodes
        path.forEach((location, index) => {
            const node = document.getElementById(`node-${location}`);
            if (node) {
                if (index === 0) {
                    node.classList.add('start');
                } else if (index === path.length - 1) {
                    node.classList.add('end');
                } else {
                    node.classList.add('selected');
                }
            }
        });
    }

    highlightEdge(from, to) {
        const edges = document.querySelectorAll('.edge');
        const fromLocation = this.locations[from];
        const toLocation = this.locations[to];

        if (!fromLocation || !toLocation) return;

        // Find the edge that connects these two points
        edges.forEach(edge => {
            const x1 = parseFloat(edge.getAttribute('x1'));
            const y1 = parseFloat(edge.getAttribute('y1'));
            const x2 = parseFloat(edge.getAttribute('x2'));
            const y2 = parseFloat(edge.getAttribute('y2'));

            const isMatch = (
                (Math.abs(x1 - fromLocation.x) < 20 && Math.abs(y1 - fromLocation.y) < 20 &&
                 Math.abs(x2 - toLocation.x) < 20 && Math.abs(y2 - toLocation.y) < 20) ||
                (Math.abs(x1 - toLocation.x) < 20 && Math.abs(y1 - toLocation.y) < 20 &&
                 Math.abs(x2 - fromLocation.x) < 20 && Math.abs(y2 - fromLocation.y) < 20)
            );

            if (isMatch) {
                edge.classList.add('path');
            }
        });
    }

    clearPath() {
        // Clear path highlighting
        document.querySelectorAll('.edge').forEach(edge => {
            edge.classList.remove('path', 'highlighted');
        });

        // Clear node highlighting except start/end selections
        document.querySelectorAll('.node').forEach(node => {
            node.classList.remove('selected');
        });

        // Update location highlights based on current selection
        this.updateLocationHighlight();

        // Hide results
        const resultsPanel = document.getElementById('pathResults');
        resultsPanel.classList.add('hidden');

        // Clear stored path
        this.currentPath = [];

        // Reset Find Path button/loading state
        const findPathBtn = document.getElementById('findPathBtn');
        findPathBtn.disabled = false;
        findPathBtn.innerHTML = '<span class="btn-icon">🧭</span> Find Optimal Route';

        // Terminate any running worker
        if (this.pathWorker) {
            this.pathWorker.terminate();
            this.pathWorker = null;
        }
    }

    showResults(results) {
        const resultsPanel = document.getElementById('pathResults');
        
        // Create enhanced results HTML
        resultsPanel.innerHTML = `
            <h3>🎯 Route Analysis Results</h3>
            <div class="result-content">
                <div class="result-grid">
                    <div class="result-item primary">
                        <span class="result-label">🤖 AI Selected Algorithm:</span>
                        <span class="result-value">${results.algorithm}</span>
                    </div>
                    <div class="result-item">
                        <span class="result-label">📏 Total Distance:</span>
                        <span class="result-value">${results.distance}m</span>
                    </div>
                    <div class="result-item">
                        <span class="result-label">👣 Number of Steps:</span>
                        <span class="result-value">${results.steps || (results.path.length - 1)}</span>
                    </div>
                    <div class="result-item">
                        <span class="result-label">🔍 Nodes Explored:</span>
                        <span class="result-value">${results.nodesExplored || 'N/A'}</span>
                    </div>
                    <div class="result-item">
                        <span class="result-label">⚡ Algorithm Time:</span>
                        <span class="result-value">${results.computationTime ? results.computationTime + 'ms' : 'N/A'}</span>
                    </div>
                    <div class="result-item">
                        <span class="result-label">🕐 Total Response Time:</span>
                        <span class="result-value">${results.clientExecutionTime ? results.clientExecutionTime + 'ms' : results.executionTime ? results.executionTime + 'ms' : 'N/A'}</span>
                    </div>
                    ${results.cached ? `
                    <div class="result-item cached">
                        <span class="result-label">💾 Cache Status:</span>
                        <span class="result-value">✅ Cached Result</span>
                    </div>
                    ` : ''}
                </div>
                
                ${results.reasoning ? `
                <div class="result-reasoning">
                    <span class="result-label">💡 Algorithm Selection Reasoning:</span>
                    <p class="reasoning-text">${results.reasoning}</p>
                </div>
                ` : ''}
                
                <div class="result-path-section">
                    <span class="result-label">🗺️ Optimal Route Path:</span>
                    <div id="resultPath" class="path-sequence"></div>
                </div>
                
                ${results.selectedMetrics ? `
                <div class="result-metrics">
                    <span class="result-label">📊 Route Metrics:</span>
                    <div class="metrics-grid">
                        <div class="metric-item">
                            <span class="metric-label">Euclidean Distance:</span>
                            <span class="metric-value">${results.selectedMetrics.euclideanDistance?.toFixed(1)} units</span>
                        </div>
                        <div class="metric-item">
                            <span class="metric-label">Graph Connectivity:</span>
                            <span class="metric-value">${results.selectedMetrics.avgConnectivity?.toFixed(2)} avg edges/node</span>
                        </div>
                        <div class="metric-item">
                            <span class="metric-label">Total Nodes:</span>
                            <span class="metric-value">${results.selectedMetrics.nodeCount}</span>
                        </div>
                    </div>
                </div>
                ` : ''}
            </div>
        `;

        // Display path sequence with icons
        const pathContainer = document.getElementById('resultPath');
        pathContainer.innerHTML = '';

        if (results.path && results.path.length > 0) {
            results.path.forEach((location, index) => {
                const stepElement = document.createElement('span');
                stepElement.className = 'path-step';
                
                const icon = this.getLocationIcon(location);
                stepElement.innerHTML = `${icon} ${this.locations[location].name}`;
                pathContainer.appendChild(stepElement);

                if (index < results.path.length - 1) {
                    const arrowElement = document.createElement('span');
                    arrowElement.className = 'path-arrow';
                    arrowElement.textContent = '→';
                    pathContainer.appendChild(arrowElement);
                }
            });
        }

        resultsPanel.classList.remove('hidden');
        
        // Add animation
        resultsPanel.style.animation = 'slideUp 0.5s ease-out';
    }
}

// Initialize the navigator when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new CampusNavigator();
});