import http from "http";
import { Server } from "socket.io";
import app from "./app.js";
import { config } from "./config/index.js";
import { startSimulation } from "./jobs/riderSimulator.js";
import {
  authenticateSocket,
  registerOrderRooms,
} from "./services/socketService.js";

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: config.CORS_ORIGINS,
    methods: ["GET", "POST"],
  },
});

io.use(authenticateSocket);
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  registerOrderRooms(socket);

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

startSimulation(io);

server.listen(config.PORT, () => {
  console.log(`Server running on port ${config.PORT}`);
});
