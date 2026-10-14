import http from "http";
import { Server } from "socket.io";
import app from "./app.js";
import { config } from "./config/index.js";
import { startSimulation } from "./jobs/riderSimulator.js";

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: config.CORS_ORIGINS,
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("join_order", (orderId) => {
    socket.join(`order:${orderId}`);
    console.log(`Socket ${socket.id} joined room order:${orderId}`);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

startSimulation(io);

server.listen(config.PORT, () => {
  console.log(`Server running on port ${config.PORT}`);
});
