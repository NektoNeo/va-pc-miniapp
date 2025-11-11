"use client";

import { memo, useCallback } from "react";
import { Button } from "@vapc/ui/components";
import { useFiltersStore, type BudgetPreset } from "@/stores/filters";

const BUDGET_OPTIONS: { value: BudgetPreset; label: string }[] = [
  { value: "none", label: "Все цены" },
  { value: "46-100", label: "46-100k" },
  { value: "100-150", label: "100-150k" },
  { value: "150-225", label: "150-225k" },
  { value: "225-300", label: "225-300k" },
  { value: "300-500", label: "300-500k" },
];

// Memoized budget button component
const BudgetButton = memo(({
  option,
  isSelected,
  onClick
}: {
  option: typeof BUDGET_OPTIONS[number];
  isSelected: boolean;
  onClick: () => void;
}) => (
  <Button
    variant={isSelected ? "default" : "outline"}
    size="sm"
    onClick={onClick}
  >
    {option.label}
  </Button>
));

BudgetButton.displayName = "BudgetButton";

export const BudgetFilter = memo(() => {
  const { budgetPreset, setBudgetPreset } = useFiltersStore();

  // Memoize handler to prevent unnecessary re-renders of child buttons
  const handlePresetChange = useCallback((value: BudgetPreset) => {
    setBudgetPreset(value);
  }, [setBudgetPreset]);

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium">Бюджет</h3>
      <div className="flex flex-wrap gap-2">
        {BUDGET_OPTIONS.map((option) => (
          <BudgetButton
            key={option.value}
            option={option}
            isSelected={budgetPreset === option.value}
            onClick={() => handlePresetChange(option.value)}
          />
        ))}
      </div>
    </div>
  );
});

BudgetFilter.displayName = "BudgetFilter";
