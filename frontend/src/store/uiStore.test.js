// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";

window.matchMedia = vi.fn(() => ({ matches: false }));
const { useUiStore } = await import("./uiStore.js");

describe("toast queue", () => {
  beforeEach(() => useUiStore.setState({ toasts: [] }));

  it("assigns distinct IDs even when notifications arrive together", () => {
    for (let index = 0; index < 5; index += 1) {
      useUiStore.getState().addToast({ message: `Item ${index}` });
    }
    const ids = useUiStore.getState().toasts.map((toast) => toast.id);
    expect(new Set(ids).size).toBe(5);
  });

  it("retains only the five newest notifications", () => {
    for (let index = 0; index < 7; index += 1) {
      useUiStore.getState().addToast({ message: `Item ${index}` });
    }
    expect(useUiStore.getState().toasts.map((toast) => toast.message)).toEqual([
      "Item 2",
      "Item 3",
      "Item 4",
      "Item 5",
      "Item 6",
    ]);
  });

  it("dismisses only the requested notification", () => {
    useUiStore.getState().addToast({ message: "First" });
    useUiStore.getState().addToast({ message: "Second" });
    useUiStore.getState().removeToast(useUiStore.getState().toasts[0].id);
    expect(useUiStore.getState().toasts.map((toast) => toast.message)).toEqual([
      "Second",
    ]);
  });
});
