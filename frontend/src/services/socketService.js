import { io } from "socket.io-client";
import { SOCKET_URL } from "../utils/constants";

let socket = null;

export const connect = (token) => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      auth: { token },
      autoConnect: false,
    });
  }
  if (!socket.connected) {
    socket.connect();
  }
  return socket;
};

export const disconnect = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const joinOrderRoom = (orderId) => {
  if (!socket) return () => {};
  const connection = socket;
  const join = () => connection.emit("join_order", orderId);
  connection.on("connect", join);
  if (connection.connected) join();
  return () => {
    connection.off("connect", join);
    connection.emit("leave_order", orderId);
  };
};

export const onTrackingUpdate = (callback) => {
  if (socket) {
    socket.on("tracking_update", callback);
    return () => socket.off("tracking_update", callback);
  }
  return () => {};
};
