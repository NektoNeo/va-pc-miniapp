import { describe, it, expect } from "vitest";
import {
  promoCampaignFormSchema,
  promoCampaignRulesSchema,
  generatePromoSlug,
  formatPromoRule,
  getPromoTypeLabel,
  calculatePromoPrice,
} from "@/lib/validations/promo-campaigns";

describe("Promo Campaigns Validation", () => {
  describe("promoCampaignRulesSchema", () => {
    it("should validate valid percentOff rules", () => {
      const validRules = {
        type: "percentOff" as const,
        value: 20,
        minPrice: 50000,
        maxPrice: 200000,
        tags: ["gaming"],
      };

      const result = promoCampaignRulesSchema.safeParse(validRules);
      expect(result.success).toBe(true);
    });

    it("should validate valid fixedOff rules", () => {
      const validRules = {
        type: "fixedOff" as const,
        value: 5000,
      };

      const result = promoCampaignRulesSchema.safeParse(validRules);
      expect(result.success).toBe(true);
    });

    it("should validate valid fixedPrice rules", () => {
      const validRules = {
        type: "fixedPrice" as const,
        value: 99990,
      };

      const result = promoCampaignRulesSchema.safeParse(validRules);
      expect(result.success).toBe(true);
    });

    it("should reject invalid rule type", () => {
      const invalidRules = {
        type: "invalid" as any,
        value: 20,
      };

      const result = promoCampaignRulesSchema.safeParse(invalidRules);
      expect(result.success).toBe(false);
    });

    it("should reject non-integer value", () => {
      const invalidRules = {
        type: "percentOff" as const,
        value: 20.5,
      };

      const result = promoCampaignRulesSchema.safeParse(invalidRules);
      expect(result.success).toBe(false);
    });

    it("should reject negative value", () => {
      const invalidRules = {
        type: "percentOff" as const,
        value: -10,
      };

      const result = promoCampaignRulesSchema.safeParse(invalidRules);
      expect(result.success).toBe(false);
    });

    it("should reject zero value", () => {
      const invalidRules = {
        type: "percentOff" as const,
        value: 0,
      };

      const result = promoCampaignRulesSchema.safeParse(invalidRules);
      expect(result.success).toBe(false);
    });
  });

  describe("promoCampaignFormSchema", () => {
    const baseValidData = {
      title: "Black Friday Sale",
      slug: "black-friday-2024",
      description: "Huge discounts on all products",
      active: true,
      startsAt: new Date("2024-11-29"),
      endsAt: new Date("2024-12-01"),
      rules: {
        type: "percentOff" as const,
        value: 25,
      },
      priority: 10,
    };

    it("should validate valid promo campaign", () => {
      const result = promoCampaignFormSchema.safeParse(baseValidData);
      expect(result.success).toBe(true);
    });

    it("should accept campaign without endsAt", () => {
      const { endsAt, ...dataWithoutEnd } = baseValidData;
      const result = promoCampaignFormSchema.safeParse(dataWithoutEnd);

      expect(result.success).toBe(true);
    });

    it("should accept null endsAt", () => {
      const data = { ...baseValidData, endsAt: null };
      const result = promoCampaignFormSchema.safeParse(data);

      expect(result.success).toBe(true);
    });

    it("should apply default priority 0", () => {
      const { priority, ...dataWithoutPriority } = baseValidData;
      const result = promoCampaignFormSchema.safeParse(dataWithoutPriority);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.priority).toBe(0);
      }
    });

    it("should apply default active false", () => {
      const { active, ...dataWithoutActive } = baseValidData;
      const result = promoCampaignFormSchema.safeParse(dataWithoutActive);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.active).toBe(false);
      }
    });

    it("should accept empty description", () => {
      const data = { ...baseValidData, description: "" };
      const result = promoCampaignFormSchema.safeParse(data);

      expect(result.success).toBe(true);
    });

    it("should accept missing description", () => {
      const { description, ...dataWithoutDescription } = baseValidData;
      const result = promoCampaignFormSchema.safeParse(dataWithoutDescription);

      expect(result.success).toBe(true);
    });

    it("should reject empty title", () => {
      const data = { ...baseValidData, title: "" };
      const result = promoCampaignFormSchema.safeParse(data);

      expect(result.success).toBe(false);
    });

    it("should reject title longer than 100 characters", () => {
      const data = { ...baseValidData, title: "a".repeat(101) };
      const result = promoCampaignFormSchema.safeParse(data);

      expect(result.success).toBe(false);
    });

    it("should reject empty slug", () => {
      const data = { ...baseValidData, slug: "" };
      const result = promoCampaignFormSchema.safeParse(data);

      expect(result.success).toBe(false);
    });

    it("should reject slug longer than 60 characters", () => {
      const data = { ...baseValidData, slug: "a".repeat(61) };
      const result = promoCampaignFormSchema.safeParse(data);

      expect(result.success).toBe(false);
    });

    it("should reject slug with uppercase letters", () => {
      const data = { ...baseValidData, slug: "Black-Friday" };
      const result = promoCampaignFormSchema.safeParse(data);

      expect(result.success).toBe(false);
    });

    it("should reject slug with underscores", () => {
      const data = { ...baseValidData, slug: "black_friday" };
      const result = promoCampaignFormSchema.safeParse(data);

      expect(result.success).toBe(false);
    });

    it("should reject description longer than 500 characters", () => {
      const data = { ...baseValidData, description: "a".repeat(501) };
      const result = promoCampaignFormSchema.safeParse(data);

      expect(result.success).toBe(false);
    });

    it("should coerce string date to Date for startsAt", () => {
      const data = { ...baseValidData, startsAt: "2024-11-29" };
      const result = promoCampaignFormSchema.safeParse(data);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.startsAt).toBeInstanceOf(Date);
      }
    });

    it("should coerce string date to Date for endsAt", () => {
      const data = { ...baseValidData, endsAt: "2024-12-01" };
      const result = promoCampaignFormSchema.safeParse(data);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.endsAt).toBeInstanceOf(Date);
      }
    });

    it("should reject invalid bannerImageId format", () => {
      const data = { ...baseValidData, bannerImageId: "invalid-cuid" };
      const result = promoCampaignFormSchema.safeParse(data);

      expect(result.success).toBe(false);
    });

    it("should accept valid bannerImageId", () => {
      const data = { ...baseValidData, bannerImageId: "cm5abc123def456gh" };
      const result = promoCampaignFormSchema.safeParse(data);

      expect(result.success).toBe(true);
    });

    it("should reject priority below 0", () => {
      const data = { ...baseValidData, priority: -1 };
      const result = promoCampaignFormSchema.safeParse(data);

      expect(result.success).toBe(false);
    });

    it("should reject priority above 999", () => {
      const data = { ...baseValidData, priority: 1000 };
      const result = promoCampaignFormSchema.safeParse(data);

      expect(result.success).toBe(false);
    });

    it("should accept priority at boundary (0)", () => {
      const data = { ...baseValidData, priority: 0 };
      const result = promoCampaignFormSchema.safeParse(data);

      expect(result.success).toBe(true);
    });

    it("should accept priority at boundary (999)", () => {
      const data = { ...baseValidData, priority: 999 };
      const result = promoCampaignFormSchema.safeParse(data);

      expect(result.success).toBe(true);
    });

    describe("refine: endsAt after startsAt", () => {
      it("should reject endsAt before startsAt", () => {
        const data = {
          ...baseValidData,
          startsAt: new Date("2024-12-01"),
          endsAt: new Date("2024-11-29"),
        };

        const result = promoCampaignFormSchema.safeParse(data);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].path).toContain("endsAt");
          expect(result.error.issues[0].message).toContain("позже");
        }
      });

      it("should reject endsAt equal to startsAt", () => {
        const sameDate = new Date("2024-11-29");
        const data = {
          ...baseValidData,
          startsAt: sameDate,
          endsAt: sameDate,
        };

        const result = promoCampaignFormSchema.safeParse(data);
        expect(result.success).toBe(false);
      });

      it("should accept endsAt after startsAt", () => {
        const data = {
          ...baseValidData,
          startsAt: new Date("2024-11-29"),
          endsAt: new Date("2024-12-31"),
        };

        const result = promoCampaignFormSchema.safeParse(data);
        expect(result.success).toBe(true);
      });
    });

    describe("refine: maxPrice > minPrice", () => {
      it("should reject maxPrice less than minPrice", () => {
        const data = {
          ...baseValidData,
          rules: {
            type: "percentOff" as const,
            value: 20,
            minPrice: 100000,
            maxPrice: 50000,
          },
        };

        const result = promoCampaignFormSchema.safeParse(data);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].path.join(".")).toContain("rules");
          expect(result.error.issues[0].message).toContain("больше");
        }
      });

      it("should reject maxPrice equal to minPrice", () => {
        const data = {
          ...baseValidData,
          rules: {
            type: "percentOff" as const,
            value: 20,
            minPrice: 100000,
            maxPrice: 100000,
          },
        };

        const result = promoCampaignFormSchema.safeParse(data);
        expect(result.success).toBe(false);
      });

      it("should accept maxPrice greater than minPrice", () => {
        const data = {
          ...baseValidData,
          rules: {
            type: "percentOff" as const,
            value: 20,
            minPrice: 50000,
            maxPrice: 200000,
          },
        };

        const result = promoCampaignFormSchema.safeParse(data);
        expect(result.success).toBe(true);
      });
    });

    describe("refine: percentOff value 1-99", () => {
      it("should reject percentOff below 1%", () => {
        const data = {
          ...baseValidData,
          rules: {
            type: "percentOff" as const,
            value: 0,
          },
        };

        const result = promoCampaignFormSchema.safeParse(data);
        expect(result.success).toBe(false);
      });

      it("should reject percentOff above 99%", () => {
        const data = {
          ...baseValidData,
          rules: {
            type: "percentOff" as const,
            value: 100,
          },
        };

        const result = promoCampaignFormSchema.safeParse(data);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toContain("1% до 99%");
        }
      });

      it("should accept percentOff at 1%", () => {
        const data = {
          ...baseValidData,
          rules: {
            type: "percentOff" as const,
            value: 1,
          },
        };

        const result = promoCampaignFormSchema.safeParse(data);
        expect(result.success).toBe(true);
      });

      it("should accept percentOff at 99%", () => {
        const data = {
          ...baseValidData,
          rules: {
            type: "percentOff" as const,
            value: 99,
          },
        };

        const result = promoCampaignFormSchema.safeParse(data);
        expect(result.success).toBe(true);
      });

      it("should not apply percent check to fixedOff", () => {
        const data = {
          ...baseValidData,
          rules: {
            type: "fixedOff" as const,
            value: 150,
          },
        };

        const result = promoCampaignFormSchema.safeParse(data);
        expect(result.success).toBe(true);
      });

      it("should not apply percent check to fixedPrice", () => {
        const data = {
          ...baseValidData,
          rules: {
            type: "fixedPrice" as const,
            value: 150000,
          },
        };

        const result = promoCampaignFormSchema.safeParse(data);
        expect(result.success).toBe(true);
      });
    });
  });

  describe("generatePromoSlug helper", () => {
    it("should generate slug from title", () => {
      const result = generatePromoSlug("Black Friday 2024");
      expect(result).toBe("black-friday-2024");
    });

    it("should remove special characters", () => {
      const result = generatePromoSlug("Summer Sale! 50% OFF");
      expect(result).toBe("summer-sale-50-off");
    });

    it("should replace spaces with dashes", () => {
      const result = generatePromoSlug("New Year Sale");
      expect(result).toBe("new-year-sale");
    });

    it("should limit length to 60 characters", () => {
      const longTitle = "a".repeat(100);
      const result = generatePromoSlug(longTitle);
      expect(result.length).toBeLessThanOrEqual(60);
    });

    it("should remove leading and trailing dashes", () => {
      const result = generatePromoSlug("-Sale-");
      expect(result).toBe("sale");
    });

    it("should replace multiple dashes with single dash", () => {
      const result = generatePromoSlug("Summer---Sale");
      expect(result).toBe("summer-sale");
    });

    it("should convert to lowercase", () => {
      const result = generatePromoSlug("SUMMER SALE");
      expect(result).toBe("summer-sale");
    });

    it("should handle empty string", () => {
      const result = generatePromoSlug("");
      expect(result).toBe("");
    });
  });

  describe("formatPromoRule helper", () => {
    it("should format percentOff", () => {
      const result = formatPromoRule("percentOff", 25);
      expect(result).toBe("-25%");
    });

    it("should format fixedOff", () => {
      const result = formatPromoRule("fixedOff", 5000);
      expect(result).toBe(`-${new Intl.NumberFormat("ru-RU").format(5000)} ₽`);
    });

    it("should format fixedPrice", () => {
      const result = formatPromoRule("fixedPrice", 99990);
      expect(result).toBe(`${new Intl.NumberFormat("ru-RU").format(99990)} ₽`);
    });
  });

  describe("getPromoTypeLabel helper", () => {
    it("should return label for percentOff", () => {
      const result = getPromoTypeLabel("percentOff");
      expect(result).toBe("Процент от цены");
    });

    it("should return label for fixedOff", () => {
      const result = getPromoTypeLabel("fixedOff");
      expect(result).toBe("Фиксированная скидка");
    });

    it("should return label for fixedPrice", () => {
      const result = getPromoTypeLabel("fixedPrice");
      expect(result).toBe("Конечная цена");
    });
  });

  describe("calculatePromoPrice helper", () => {
    describe("percentOff", () => {
      it("should calculate correct discounted price", () => {
        const rules = {
          type: "percentOff" as const,
          value: 20,
        };
        const result = calculatePromoPrice(100000, rules);
        expect(result).toBe(80000);
      });

      it("should round to nearest integer", () => {
        const rules = {
          type: "percentOff" as const,
          value: 15,
        };
        const result = calculatePromoPrice(100000, rules);
        expect(result).toBe(85000);
      });
    });

    describe("fixedOff", () => {
      it("should subtract fixed amount", () => {
        const rules = {
          type: "fixedOff" as const,
          value: 5000,
        };
        const result = calculatePromoPrice(100000, rules);
        expect(result).toBe(95000);
      });

      it("should not go below zero", () => {
        const rules = {
          type: "fixedOff" as const,
          value: 150000,
        };
        const result = calculatePromoPrice(100000, rules);
        expect(result).toBe(0);
      });
    });

    describe("fixedPrice", () => {
      it("should return fixed price", () => {
        const rules = {
          type: "fixedPrice" as const,
          value: 99990,
        };
        const result = calculatePromoPrice(150000, rules);
        expect(result).toBe(99990);
      });
    });

    describe("price range filters", () => {
      it("should return null if price below minPrice", () => {
        const rules = {
          type: "percentOff" as const,
          value: 20,
          minPrice: 100000,
        };
        const result = calculatePromoPrice(50000, rules);
        expect(result).toBeNull();
      });

      it("should return null if price above maxPrice", () => {
        const rules = {
          type: "percentOff" as const,
          value: 20,
          maxPrice: 100000,
        };
        const result = calculatePromoPrice(150000, rules);
        expect(result).toBeNull();
      });

      it("should apply promo if price equals minPrice", () => {
        const rules = {
          type: "percentOff" as const,
          value: 20,
          minPrice: 100000,
        };
        const result = calculatePromoPrice(100000, rules);
        expect(result).toBe(80000);
      });

      it("should apply promo if price equals maxPrice", () => {
        const rules = {
          type: "percentOff" as const,
          value: 20,
          maxPrice: 100000,
        };
        const result = calculatePromoPrice(100000, rules);
        expect(result).toBe(80000);
      });

      it("should apply promo if price within range", () => {
        const rules = {
          type: "percentOff" as const,
          value: 20,
          minPrice: 50000,
          maxPrice: 200000,
        };
        const result = calculatePromoPrice(100000, rules);
        expect(result).toBe(80000);
      });
    });
  });
});
