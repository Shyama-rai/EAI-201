# 🧭 BotBrain - AI-Powered Campus Navigator

An intelligent campus navigation system that helps students and visitors find optimal routes between locations using advanced pathfinding algorithms.

![Campus Navigation](./map%20AIML.jpg)

## ✨ Features

- **🎯 Smart Algorithm Selection**: Automatically chooses the best pathfinding algorithm (Dijkstra's, A*, BFS, DFS) based on route characteristics
- **⚡ High Performance**: Optimized with binary heap priority queues and intelligent caching system
- **📊 Detailed Analytics**: Provides comprehensive metrics including distance, nodes explored, execution time, and algorithm used
- **🗺️ Interactive Campus Map**: Visual SVG-based campus map with location icons and tooltips
- **💨 Real-time Path Visualization**: Dynamic path highlighting with smooth animations
- **📱 Responsive Design**: Modern UI that works seamlessly on desktop and mobile devices
- **🔔 Smart Notifications**: Real-time feedback with contextual notifications

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd BotBrain
```

2. Install backend dependencies:
```bash
cd backend
npm install
```

3. Install frontend dependencies:
```bash
cd ../frontend
npm install
```

### Running the Application

1. Start the backend server:
```bash
cd backend
npm start
# Server runs on http://localhost:3001
```

2. Start the frontend development server:
```bash
cd frontend
npm run dev
# Frontend runs on http://localhost:5173
```

3. Open your browser and navigate to `http://localhost:5173`

## 🛠️ Technology Stack

### Backend
- **Node.js** with Express.js
- **Advanced Pathfinding Algorithms**:
  - Dijkstra's Algorithm (shortest path)
  - A* Algorithm (heuristic-based)
  - Breadth-First Search (unweighted)
  - Depth-First Search (exploration)
- **Performance Optimizations**:
  - Binary heap priority queue
  - Route caching system (1000 entry limit)
  - Timeout protection (10s limit)

### Frontend
- **Vanilla JavaScript** for lightweight performance
- **Interactive SVG** for campus map visualization
- **Modern CSS** with glassmorphism effects
- **Responsive Design** with Tailwind CSS integration
- **Vite** for fast development and building

## 🏗️ Architecture

```
BotBrain/
├── backend/
│   ├── server.js          # Main server with pathfinding logic
│   └── package.json       # Backend dependencies
├── frontend/
│   ├── src/
│   │   ├── App.tsx        # Main React component (if used)
│   │   └── main.tsx       # Entry point
│   ├── script.js          # Core frontend logic
│   ├── styles.css         # Modern UI styling
│   ├── index.html         # Main HTML file
│   └── package.json       # Frontend dependencies
└── README.md
```

## 🎮 Usage

1. **Select Starting Point**: Click on any location on the campus map
2. **Choose Destination**: Click on your target destination
3. **Find Path**: The system automatically selects the optimal algorithm and calculates the best route
4. **View Results**: See detailed analytics including:
   - Total distance
   - Number of nodes explored
   - Execution time
   - Algorithm used
   - Step-by-step directions

## 🧮 Algorithms

### Dijkstra's Algorithm
- **Use Case**: Finding the shortest path with weighted edges
- **Time Complexity**: O((V + E) log V)
- **Best For**: Routes where distance accuracy is critical

### A* Algorithm  
- **Use Case**: Heuristic-based pathfinding with manhattan distance
- **Time Complexity**: O(b^d) where b is branching factor
- **Best For**: Large maps where direction matters

### Breadth-First Search (BFS)
- **Use Case**: Unweighted shortest path
- **Time Complexity**: O(V + E)
- **Best For**: Simple routes with uniform costs

### Depth-First Search (DFS)
- **Use Case**: Path exploration and connectivity
- **Time Complexity**: O(V + E)
- **Best For**: Route discovery and alternative paths

## 🚄 Performance Features

- **Smart Caching**: Recently calculated routes are cached for instant retrieval
- **Binary Heap**: Efficient priority queue implementation for optimal performance
- **Algorithm Intelligence**: Automatically selects the best algorithm based on:
  - Graph density
  - Route distance
  - Historical performance

## 📈 Analytics Dashboard

The system provides comprehensive analytics for each route calculation:
- **Distance**: Total route distance in meters
- **Nodes Explored**: Number of nodes processed during pathfinding
- **Execution Time**: Algorithm execution time in milliseconds
- **Cache Status**: Whether the result was cached or newly calculated
- **Algorithm Used**: Which pathfinding algorithm was selected

## 🎨 Modern UI Features

- **Glassmorphism Design**: Modern glass-like interface elements
- **Smooth Animations**: Subtle micro-interactions and transitions
- **Dark/Light Themes**: Automatic theme adaptation
- **Mobile Responsive**: Optimized for all screen sizes
- **Interactive Map**: Hover effects and dynamic highlighting

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👨‍💻 Author

**Shyama Rai**
- Week 1-4 Development Reports included in repository
- Campus Navigation System Implementation
- Advanced Algorithm Integration

## 🙏 Acknowledgments

- Campus map data and layout design
- Pathfinding algorithm implementations
- Modern UI/UX design patterns
- Performance optimization techniques

---

Made with ❤️ for better campus navigation
