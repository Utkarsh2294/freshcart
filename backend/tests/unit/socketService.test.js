import { beforeEach, describe, expect, it, vi } from "vitest";
import jwt from "jsonwebtoken";
import { config } from "../../src/config/index.js";
import { pool } from "../../src/config/database.js";
import {
  authenticateSocket,
  registerOrderRooms,
} from "../../src/services/socketService.js";

vi.mock("../../src/config/database.js", () => ({ pool: { query: vi.fn() } }));
beforeEach(() => vi.resetAllMocks());

describe("order tracking isolation", () => {
  it("rejects connections without a valid token", () => {
    const next = vi.fn();
    authenticateSocket({ handshake: { auth: {} }, data: {} }, next);
    expect(next.mock.calls[0][0].message).toBe("Unauthorized");
  });

  it("reads the identity from a verified token", () => {
    const socket = {
      handshake: { auth: { token: jwt.sign({ id: 42 }, config.JWT_SECRET) } },
      data: {},
    };
    const next = vi.fn();
    authenticateSocket(socket, next);
    expect(socket.data.userId).toBe(42);
    expect(next).toHaveBeenCalledWith();
  });

  it("joins only orders belonging to this shopper", async () => {
    const handlers = {};
    const socket = {
      data: { userId: 42 },
      on: (event, fn) => {
        handlers[event] = fn;
      },
      join: vi.fn(),
      leave: vi.fn(),
      emit: vi.fn(),
    };
    registerOrderRooms(socket);
    pool.query
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [{ id: 4 }] });
    await handlers.join_order(3);
    expect(socket.join).not.toHaveBeenCalled();
    await handlers.join_order(4);
    expect(pool.query).toHaveBeenLastCalledWith(expect.any(String), [4, 42]);
    expect(socket.join).toHaveBeenCalledWith("order:4");
    await handlers.join_order("malformed");
    expect(pool.query).toHaveBeenCalledTimes(2);
  });
});
