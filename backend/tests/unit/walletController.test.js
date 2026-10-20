import { expect, it, vi } from "vitest";
import { pool } from "../../src/config/database.js";
import { getWallet } from "../../src/controllers/walletController.js";

vi.mock("../../src/config/database.js", () => ({ pool: { query: vi.fn() } }));

it("preserves paise when PostgreSQL returns a decimal balance as text", async () => {
  pool.query
    .mockResolvedValueOnce({ rows: [{ balance: "75.50" }] })
    .mockResolvedValueOnce({ rows: [] });
  const res = { json: vi.fn() };
  const next = vi.fn();
  await getWallet({ user: { id: 1 } }, res, next);
  expect(res.json).toHaveBeenCalledWith({ balance: 75.5, transactions: [] });
  expect(next).not.toHaveBeenCalled();
});
