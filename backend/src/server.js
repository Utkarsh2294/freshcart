import http from 'http';
import { Server } from 'socket.io';
import app from './app.js';
import { config } from './config/index.js';
import { startSimulation } from './jobs/riderSimulator.js';

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      'http://localhost:5175',
      'http://127.0.0.1:5175',
    ],
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('join_order', (orderId) => {
    socket.join(`order:${orderId}`);
    console.log(`Socket ${socket.id} joined room order:${orderId}`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

startSimulation(io);

server.listen(config.PORT, () => {
  console.log(`Server running on port ${config.PORT}`);
});
