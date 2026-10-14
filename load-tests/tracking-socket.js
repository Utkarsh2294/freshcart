import ws from "k6/ws";
import { check } from "k6";

export const options = {
  scenarios: {
    tracking: { executor: "constant-vus", vus: 20, duration: "60s" },
  },
  thresholds: {
    ws_connecting: ["p(95)<1000"],
    checks: ["rate>0.99"],
  },
};

const socketUrl =
  __ENV.SOCKET_URL ||
  "ws://localhost:4000/socket.io/?EIO=4&transport=websocket";

export default function () {
  const response = ws.connect(socketUrl, {}, (socket) => {
    socket.on("open", () => {
      socket.send("40");
      socket.send(`42["join_order","${__ENV.ORDER_ID || 1}"]`);
      socket.setTimeout(() => socket.close(), 10000);
    });
    socket.on("message", (message) => {
      if (message === "2") socket.send("3");
    });
  });
  check(response, {
    "Socket.IO transport connected": (result) => result?.status === 101,
  });
}
