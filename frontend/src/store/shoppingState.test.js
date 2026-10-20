import { beforeEach, describe, expect, it, vi } from "vitest";
import { useProductStore } from "./productStore";
import { useCartStore } from "./cartStore";
import * as products from "../services/productService";
import * as cart from "../services/cartService";

vi.mock("../services/productService", () => ({ getProducts: vi.fn() }));
vi.mock("../services/cartService", () => ({
  getCart: vi.fn(),
  updateItem: vi.fn(),
  removeItem: vi.fn(),
}));

beforeEach(() => {
  vi.resetAllMocks();
  useProductStore.setState({
    requestId: 0,
    products: [],
    filters: {},
    error: "",
  });
  useCartStore.setState({ items: [], pendingItems: [], error: "" });
});

describe("shopping request races", () => {
  it("keeps the newest catalog response when an older search finishes later", async () => {
    let finishFirst;
    products.getProducts
      .mockReturnValueOnce(
        new Promise((resolve) => {
          finishFirst = resolve;
        }),
      )
      .mockResolvedValueOnce({
        products: [{ id: 2 }],
        page: 1,
        total: 1,
        totalPages: 1,
      });
    const first = useProductStore.getState().fetchProducts();
    await useProductStore.getState().fetchProducts();
    finishFirst({ products: [{ id: 1 }], page: 1, total: 1, totalPages: 1 });
    await first;
    expect(useProductStore.getState().products).toEqual([{ id: 2 }]);
    expect(useProductStore.getState().isLoading).toBe(false);
  });

  it("does not hide a failed cart fetch as an empty successful cart", async () => {
    cart.getCart.mockRejectedValue(new Error("Offline"));
    await useCartStore.getState().fetchCart();
    expect(useCartStore.getState().error).toContain("could not be loaded");
  });

  it("serializes quantity changes for the same cart item and releases the lock on failure", async () => {
    let fail;
    cart.updateItem.mockReturnValueOnce(
      new Promise((resolve, reject) => {
        fail = reject;
      }),
    );
    const first = useCartStore.getState().updateItem(4, 2);
    await useCartStore.getState().updateItem(4, 3);
    expect(cart.updateItem).toHaveBeenCalledTimes(1);
    fail(new Error("No stock"));
    await expect(first).rejects.toThrow("No stock");
    expect(useCartStore.getState().pendingItems).toEqual([]);
  });
});
