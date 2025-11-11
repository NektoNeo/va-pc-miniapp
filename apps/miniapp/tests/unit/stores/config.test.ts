import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useConfigStore } from "@/stores/config";
import type { ConfigOption } from "@/types/pc";

describe("useConfigStore", () => {
  const mockRamOption1: ConfigOption = {
    id: "ram-16gb",
    label: "16GB DDR4",
    priceDelta: 0,
    default: true,
  };

  const mockRamOption2: ConfigOption = {
    id: "ram-32gb",
    label: "32GB DDR4",
    priceDelta: 5000,
    default: false,
  };

  const mockSsdOption1: ConfigOption = {
    id: "ssd-500gb",
    label: "500GB NVMe",
    priceDelta: 0,
    default: true,
  };

  const mockSsdOption2: ConfigOption = {
    id: "ssd-1tb",
    label: "1TB NVMe",
    priceDelta: 3000,
    default: false,
  };

  beforeEach(() => {
    // Reset store to initial state
    const { result } = renderHook(() => useConfigStore());
    act(() => {
      result.current.reset();
    });
  });

  describe("Initial State", () => {
    it("should have correct initial values", () => {
      const { result } = renderHook(() => useConfigStore());

      expect(result.current.selectedRam).toBeNull();
      expect(result.current.selectedSsd).toBeNull();
      expect(result.current.basePrice).toBe(0);
      expect(result.current.getTotalPrice()).toBe(0);
    });
  });

  describe("Base Price", () => {
    it("should set base price correctly", () => {
      const { result } = renderHook(() => useConfigStore());

      act(() => {
        result.current.setBasePrice(100000);
      });

      expect(result.current.basePrice).toBe(100000);
      expect(result.current.getTotalPrice()).toBe(100000);
    });

    it("should update total price when base price changes", () => {
      const { result } = renderHook(() => useConfigStore());

      act(() => {
        result.current.setBasePrice(50000);
      });

      expect(result.current.getTotalPrice()).toBe(50000);

      act(() => {
        result.current.setBasePrice(75000);
      });

      expect(result.current.getTotalPrice()).toBe(75000);
    });
  });

  describe("RAM Selection", () => {
    it("should select RAM option", () => {
      const { result } = renderHook(() => useConfigStore());

      act(() => {
        result.current.setSelectedRam(mockRamOption1);
      });

      expect(result.current.selectedRam).toEqual(mockRamOption1);
    });

    it("should update total price with RAM delta", () => {
      const { result } = renderHook(() => useConfigStore());

      act(() => {
        result.current.setBasePrice(100000);
        result.current.setSelectedRam(mockRamOption2); // +5000
      });

      expect(result.current.getTotalPrice()).toBe(105000);
    });

    it("should change RAM selection and update price", () => {
      const { result } = renderHook(() => useConfigStore());

      act(() => {
        result.current.setBasePrice(100000);
        result.current.setSelectedRam(mockRamOption1); // +0
      });

      expect(result.current.getTotalPrice()).toBe(100000);

      act(() => {
        result.current.setSelectedRam(mockRamOption2); // +5000
      });

      expect(result.current.getTotalPrice()).toBe(105000);
    });
  });

  describe("SSD Selection", () => {
    it("should select SSD option", () => {
      const { result } = renderHook(() => useConfigStore());

      act(() => {
        result.current.setSelectedSsd(mockSsdOption1);
      });

      expect(result.current.selectedSsd).toEqual(mockSsdOption1);
    });

    it("should update total price with SSD delta", () => {
      const { result } = renderHook(() => useConfigStore());

      act(() => {
        result.current.setBasePrice(100000);
        result.current.setSelectedSsd(mockSsdOption2); // +3000
      });

      expect(result.current.getTotalPrice()).toBe(103000);
    });

    it("should change SSD selection and update price", () => {
      const { result } = renderHook(() => useConfigStore());

      act(() => {
        result.current.setBasePrice(100000);
        result.current.setSelectedSsd(mockSsdOption1); // +0
      });

      expect(result.current.getTotalPrice()).toBe(100000);

      act(() => {
        result.current.setSelectedSsd(mockSsdOption2); // +3000
      });

      expect(result.current.getTotalPrice()).toBe(103000);
    });
  });

  describe("Combined Configuration", () => {
    it("should calculate total price with both RAM and SSD deltas", () => {
      const { result } = renderHook(() => useConfigStore());

      act(() => {
        result.current.setBasePrice(100000);
        result.current.setSelectedRam(mockRamOption2); // +5000
        result.current.setSelectedSsd(mockSsdOption2); // +3000
      });

      expect(result.current.getTotalPrice()).toBe(108000);
    });

    it("should handle zero deltas correctly", () => {
      const { result } = renderHook(() => useConfigStore());

      act(() => {
        result.current.setBasePrice(100000);
        result.current.setSelectedRam(mockRamOption1); // +0
        result.current.setSelectedSsd(mockSsdOption1); // +0
      });

      expect(result.current.getTotalPrice()).toBe(100000);
    });

    it("should handle negative price deltas", () => {
      const { result } = renderHook(() => useConfigStore());

      const cheaperRam: ConfigOption = {
        id: "ram-8gb",
        label: "8GB DDR4",
        priceDelta: -2000,
        default: false,
      };

      act(() => {
        result.current.setBasePrice(100000);
        result.current.setSelectedRam(cheaperRam); // -2000
      });

      expect(result.current.getTotalPrice()).toBe(98000);
    });
  });

  describe("Reset", () => {
    it("should reset all configuration to initial state", () => {
      const { result } = renderHook(() => useConfigStore());

      // Set some configuration
      act(() => {
        result.current.setBasePrice(100000);
        result.current.setSelectedRam(mockRamOption2);
        result.current.setSelectedSsd(mockSsdOption2);
      });

      // Reset
      act(() => {
        result.current.reset();
      });

      expect(result.current.selectedRam).toBeNull();
      expect(result.current.selectedSsd).toBeNull();
      expect(result.current.basePrice).toBe(0);
      expect(result.current.getTotalPrice()).toBe(0);
    });
  });

  describe("Price Calculation Edge Cases", () => {
    it("should handle getTotalPrice with null selections", () => {
      const { result } = renderHook(() => useConfigStore());

      act(() => {
        result.current.setBasePrice(100000);
      });

      expect(result.current.getTotalPrice()).toBe(100000);
    });

    it("should handle large price deltas", () => {
      const { result } = renderHook(() => useConfigStore());

      const expensiveRam: ConfigOption = {
        id: "ram-128gb",
        label: "128GB DDR5",
        priceDelta: 50000,
        default: false,
      };

      act(() => {
        result.current.setBasePrice(100000);
        result.current.setSelectedRam(expensiveRam);
      });

      expect(result.current.getTotalPrice()).toBe(150000);
    });
  });
});
