import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useFiltersStore } from "@/stores/filters";

describe("useFiltersStore", () => {
  beforeEach(() => {
    // Reset store to initial state
    const { result } = renderHook(() => useFiltersStore());
    act(() => {
      result.current.clearFilters();
    });
  });

  describe("Initial State", () => {
    it("should have correct initial values", () => {
      const { result } = renderHook(() => useFiltersStore());

      expect(result.current.budgetPreset).toBe("none");
      expect(result.current.qualityFilter).toBeNull();
      expect(result.current.getBudgetRange()).toBeNull();
    });
  });

  describe("Budget Preset", () => {
    it("should set budget preset correctly", () => {
      const { result } = renderHook(() => useFiltersStore());

      act(() => {
        result.current.setBudgetPreset("100-150");
      });

      expect(result.current.budgetPreset).toBe("100-150");
    });

    it("should return correct budget range for 46-100", () => {
      const { result } = renderHook(() => useFiltersStore());

      act(() => {
        result.current.setBudgetPreset("46-100");
      });

      const range = result.current.getBudgetRange();
      expect(range).toEqual({ min: 46000, max: 100000 });
    });

    it("should return correct budget range for 100-150", () => {
      const { result } = renderHook(() => useFiltersStore());

      act(() => {
        result.current.setBudgetPreset("100-150");
      });

      const range = result.current.getBudgetRange();
      expect(range).toEqual({ min: 100000, max: 150000 });
    });

    it("should return correct budget range for 150-225", () => {
      const { result } = renderHook(() => useFiltersStore());

      act(() => {
        result.current.setBudgetPreset("150-225");
      });

      const range = result.current.getBudgetRange();
      expect(range).toEqual({ min: 150000, max: 225000 });
    });

    it("should return correct budget range for 225-300", () => {
      const { result } = renderHook(() => useFiltersStore());

      act(() => {
        result.current.setBudgetPreset("225-300");
      });

      const range = result.current.getBudgetRange();
      expect(range).toEqual({ min: 225000, max: 300000 });
    });

    it("should return correct budget range for 300-500", () => {
      const { result } = renderHook(() => useFiltersStore());

      act(() => {
        result.current.setBudgetPreset("300-500");
      });

      const range = result.current.getBudgetRange();
      expect(range).toEqual({ min: 300000, max: 500000 });
    });

    it("should return null for 'none' budget preset", () => {
      const { result } = renderHook(() => useFiltersStore());

      act(() => {
        result.current.setBudgetPreset("none");
      });

      expect(result.current.getBudgetRange()).toBeNull();
    });
  });

  describe("Quality Filter", () => {
    it("should set quality filter to FHD", () => {
      const { result } = renderHook(() => useFiltersStore());

      act(() => {
        result.current.setQualityFilter("FHD");
      });

      expect(result.current.qualityFilter).toBe("FHD");
    });

    it("should set quality filter to 2K", () => {
      const { result } = renderHook(() => useFiltersStore());

      act(() => {
        result.current.setQualityFilter("2K");
      });

      expect(result.current.qualityFilter).toBe("2K");
    });

    it("should set quality filter to 4K", () => {
      const { result } = renderHook(() => useFiltersStore());

      act(() => {
        result.current.setQualityFilter("4K");
      });

      expect(result.current.qualityFilter).toBe("4K");
    });

    it("should clear quality filter to null", () => {
      const { result } = renderHook(() => useFiltersStore());

      act(() => {
        result.current.setQualityFilter("FHD");
        result.current.setQualityFilter(null);
      });

      expect(result.current.qualityFilter).toBeNull();
    });
  });

  describe("Clear Filters", () => {
    it("should reset all filters to initial state", () => {
      const { result } = renderHook(() => useFiltersStore());

      // Set some filters
      act(() => {
        result.current.setBudgetPreset("100-150");
        result.current.setQualityFilter("FHD");
      });

      // Clear filters
      act(() => {
        result.current.clearFilters();
      });

      expect(result.current.budgetPreset).toBe("none");
      expect(result.current.qualityFilter).toBeNull();
      expect(result.current.getBudgetRange()).toBeNull();
    });
  });

  describe("Combined Filters", () => {
    it("should handle budget and quality filters together", () => {
      const { result } = renderHook(() => useFiltersStore());

      act(() => {
        result.current.setBudgetPreset("150-225");
        result.current.setQualityFilter("2K");
      });

      expect(result.current.budgetPreset).toBe("150-225");
      expect(result.current.qualityFilter).toBe("2K");
      expect(result.current.getBudgetRange()).toEqual({
        min: 150000,
        max: 225000,
      });
    });
  });
});
