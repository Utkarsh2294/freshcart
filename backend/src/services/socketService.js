import jwt from "jsonwebtoken";
import { config } from "../config/index.js";
import { pool } from "../config/database.js";

export function authenticateSocket(socket, next) {
  try {
    const user = jwt.verify(socket.handshake.auth?.token, config.JWT_SECRET);
    socket.data.userId = user.id;
    next();
  } catch {
    next(new Error("Unauthorized"));
  }
}

export function registerOrderRooms(socket) {
  socket.on("join_order", async (value) => {
    const orderId = Number(value);
    if (!Number.isSafeInteger(orderId) || orderId <= 0) return;
    try {
      const result = await pool.query(
        "SELECT id FROM orders WHERE id = $1 AND user_id = $2",
        [orderId, socket.data.userId],
      );
      if (result.rows.length) socket.join(`order:${orderId}`);
    } catch {
      socket.emit("order_error", { message: "Order tracking is unavailable." });
    }
  });
  socket.on("leave_order", (value) => {
    const orderId = Number(value);
    if (Number.isSafeInteger(orderId) && orderId > 0)
      socket.leave(`order:${orderId}`);
  });
}
