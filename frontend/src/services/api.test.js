import { afterEach, beforeEach, expect, it, vi } from "vitest";
import api from "./api";
import { useAuthStore } from "../store/authStore";

vi.mock("../store/authStore", () => ({ useAuthStore: { getState: vi.fn() } }));
const originalAdapter = api.defaults.adapter;
beforeEach(() => {
  const values = new Map([
    ["freshcart_guest_key", "f3f930bb-c9bc-4362-a365-d345be346de5"],
    ["freshcart_token", "expired"],
  ]);
  vi.stubGlobal("localStorage", {
    getItem: (key) => values.get(key) || null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key),
  });
  useAuthStore.getState.mockReturnValue({
    user: { role: "customer" },
    login: (user, token) => values.set("freshcart_token", token),
  });
});
afterEach(() => {
  api.defaults.adapter = originalAdapter;
  vi.unstubAllGlobals();
});

it("renews an expired guest session once for concurrent failed requests", async () => {
  let renewals = 0;
  api.defaults.adapter = async (config) => {
    if (config.url === "/auth/guest") {
      renewals += 1;
      await new Promise((resolve) => setTimeout(resolve, 10));
      return {
        data: { user: { role: "customer" }, accessToken: "fresh" },
        status: 200,
        config,
      };
    }
    if (config.headers.Authorization === "Bearer expired")
      throw { config, response: { status: 401 } };
    return { data: "ok", status: 200, config };
  };
  const results = await Promise.all([api.get("/cart"), api.get("/orders")]);
  expect(renewals).toBe(1);
  expect(results.map((result) => result.data)).toEqual(["ok", "ok"]);
});

it("does not retry a repeatedly unauthorized request forever", async () => {
  let attempts = 0;
  api.defaults.adapter = async (config) => {
    if (config.url === "/auth/guest")
      return {
        data: { user: { role: "customer" }, accessToken: "fresh" },
        status: 200,
        config,
      };
    attempts += 1;
    throw { config, response: { status: 401 } };
  };
  await expect(api.get("/cart")).rejects.toMatchObject({
    response: { status: 401 },
  });
  expect(attempts).toBe(2);
});
