import { describe, it, expect } from "vitest";
import {
  pcSpecSchema,
  optionVariantSchema,
  pcOptionsSchema,
  createPCBuildSchema,
  updatePCBuildSchema,
  pcBuildQuerySchema,
  ResolutionEnum,
  AvailabilityEnum,
  generateSlug,
  formatPrice,
  parseSpec,
  parseOptions,
} from "@/lib/validations/pc-builds";

describe("PC Builds Validation", () => {
  describe("pcSpecSchema", () => {
    const validSpec = {
      cpu: "AMD Ryzen 7 7800X3D",
      gpu: "RTX 4070 Super",
      ram: "32GB DDR5",
      ssd: "2TB NVMe",
      motherboard: "ASUS B650",
      psu: "750W 80+ Gold",
      cooling: "Arctic Liquid Freezer II",
      case: "Lian Li O11 Dynamic",
    };

    it("should validate valid spec", () => {
      const result = pcSpecSchema.safeParse(validSpec);
      expect(result.success).toBe(true);
    });

    it("should validate spec with only required fields", () => {
      const minimalSpec = {
        cpu: "AMD Ryzen 7 7800X3D",
        gpu: "RTX 4070 Super",
        ram: "32GB DDR5",
        ssd: "2TB NVMe",
      };

      const result = pcSpecSchema.safeParse(minimalSpec);
      expect(result.success).toBe(true);
    });

    it("should reject missing cpu", () => {
      const { cpu, ...specWithoutCpu } = validSpec;
      const result = pcSpecSchema.safeParse(specWithoutCpu);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("обязателен");
      }
    });

    it("should reject missing gpu", () => {
      const { gpu, ...specWithoutGpu } = validSpec;
      const result = pcSpecSchema.safeParse(specWithoutGpu);

      expect(result.success).toBe(false);
    });

    it("should reject missing ram", () => {
      const { ram, ...specWithoutRam } = validSpec;
      const result = pcSpecSchema.safeParse(specWithoutRam);

      expect(result.success).toBe(false);
    });

    it("should reject missing ssd", () => {
      const { ssd, ...specWithoutSsd } = validSpec;
      const result = pcSpecSchema.safeParse(specWithoutSsd);

      expect(result.success).toBe(false);
    });

    it("should reject cpu shorter than 3 characters", () => {
      const spec = { ...validSpec, cpu: "AB" };
      const result = pcSpecSchema.safeParse(spec);

      expect(result.success).toBe(false);
    });

    it("should reject cpu longer than 100 characters", () => {
      const spec = { ...validSpec, cpu: "a".repeat(101) };
      const result = pcSpecSchema.safeParse(spec);

      expect(result.success).toBe(false);
    });

    it("should accept optional fields as undefined", () => {
      const spec = {
        cpu: "AMD Ryzen 7 7800X3D",
        gpu: "RTX 4070 Super",
        ram: "32GB DDR5",
        ssd: "2TB NVMe",
        motherboard: undefined,
        psu: undefined,
        cooling: undefined,
        case: undefined,
      };

      const result = pcSpecSchema.safeParse(spec);
      expect(result.success).toBe(true);
    });
  });

  describe("optionVariantSchema", () => {
    it("should validate valid option variant", () => {
      const validVariant = {
        label: "32GB DDR5",
        sizeGb: 32,
        delta: 0,
      };

      const result = optionVariantSchema.safeParse(validVariant);
      expect(result.success).toBe(true);
    });

    it("should validate variant without sizeGb", () => {
      const variant = {
        label: "RTX 4070 Super",
        delta: 5000,
      };

      const result = optionVariantSchema.safeParse(variant);
      expect(result.success).toBe(true);
    });

    it("should accept negative delta", () => {
      const variant = {
        label: "16GB DDR5",
        delta: -3000,
      };

      const result = optionVariantSchema.safeParse(variant);
      expect(result.success).toBe(true);
    });

    it("should accept zero delta", () => {
      const variant = {
        label: "Base option",
        delta: 0,
      };

      const result = optionVariantSchema.safeParse(variant);
      expect(result.success).toBe(true);
    });

    it("should reject missing label", () => {
      const variant = {
        delta: 0,
      };

      const result = optionVariantSchema.safeParse(variant);
      expect(result.success).toBe(false);
    });

    it("should reject missing delta", () => {
      const variant = {
        label: "32GB DDR5",
      };

      const result = optionVariantSchema.safeParse(variant);
      expect(result.success).toBe(false);
    });

    it("should reject label shorter than 2 characters", () => {
      const variant = {
        label: "A",
        delta: 0,
      };

      const result = optionVariantSchema.safeParse(variant);
      expect(result.success).toBe(false);
    });

    it("should reject label longer than 50 characters", () => {
      const variant = {
        label: "a".repeat(51),
        delta: 0,
      };

      const result = optionVariantSchema.safeParse(variant);
      expect(result.success).toBe(false);
    });

    it("should reject non-integer sizeGb", () => {
      const variant = {
        label: "32GB",
        sizeGb: 32.5,
        delta: 0,
      };

      const result = optionVariantSchema.safeParse(variant);
      expect(result.success).toBe(false);
    });

    it("should reject negative sizeGb", () => {
      const variant = {
        label: "32GB",
        sizeGb: -32,
        delta: 0,
      };

      const result = optionVariantSchema.safeParse(variant);
      expect(result.success).toBe(false);
    });

    it("should reject non-integer delta", () => {
      const variant = {
        label: "32GB",
        delta: 1000.5,
      };

      const result = optionVariantSchema.safeParse(variant);
      expect(result.success).toBe(false);
    });
  });

  describe("pcOptionsSchema", () => {
    it("should validate valid options", () => {
      const validOptions = {
        ram: [
          { label: "16GB", delta: -3000 },
          { label: "32GB", delta: 0 },
        ],
        ssd: [
          { label: "1TB", delta: 0 },
          { label: "2TB", delta: 2000 },
        ],
      };

      const result = pcOptionsSchema.safeParse(validOptions);
      expect(result.success).toBe(true);
    });

    it("should validate with single category", () => {
      const options = {
        ram: [{ label: "32GB", delta: 0 }],
      };

      const result = pcOptionsSchema.safeParse(options);
      expect(result.success).toBe(true);
    });

    it("should reject empty object", () => {
      const emptyOptions = {};
      const result = pcOptionsSchema.safeParse(emptyOptions);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("хотя бы одна");
      }
    });

    it("should reject empty arrays", () => {
      const options = {
        ram: [],
      };

      const result = pcOptionsSchema.safeParse(options);
      expect(result.success).toBe(false);
    });

    it("should reject more than 5 variants", () => {
      const options = {
        ram: [
          { label: "8GB", delta: -5000 },
          { label: "16GB", delta: -3000 },
          { label: "32GB", delta: 0 },
          { label: "64GB", delta: 5000 },
          { label: "96GB", delta: 10000 },
          { label: "128GB", delta: 15000 },
        ],
      };

      const result = pcOptionsSchema.safeParse(options);
      expect(result.success).toBe(false);
    });

    it("should accept all 4 categories", () => {
      const options = {
        ram: [{ label: "32GB", delta: 0 }],
        ssd: [{ label: "1TB", delta: 0 }],
        gpu: [{ label: "RTX 4070", delta: 0 }],
        cooling: [{ label: "Air", delta: 0 }],
      };

      const result = pcOptionsSchema.safeParse(options);
      expect(result.success).toBe(true);
    });
  });

  describe("createPCBuildSchema", () => {
    const validCUID = "cm5abc123def456gh";
    const validBuild = {
      slug: "gaming-pc-rtx-4070-super",
      title: "Gaming PC RTX 4070 Super",
      subtitle: "Ultimate gaming performance",
      coverImageId: validCUID,
      videoId: validCUID,
      gallery: [validCUID, validCUID],
      priceBase: 150000,
      targets: ["FHD" as const, "QHD" as const],
      spec: {
        cpu: "AMD Ryzen 7 7800X3D",
        gpu: "RTX 4070 Super",
        ram: "32GB DDR5",
        ssd: "2TB NVMe",
      },
      options: {
        ram: [{ label: "32GB", delta: 0 }],
      },
      isTop: false,
      badges: ["Popular"],
      availability: "IN_STOCK" as const,
    };

    it("should validate valid PC build", () => {
      const result = createPCBuildSchema.safeParse(validBuild);
      expect(result.success).toBe(true);
    });

    it("should validate with minimal required fields", () => {
      const minimalBuild = {
        slug: "gaming-pc",
        title: "Gaming PC",
        coverImageId: validCUID,
        priceBase: 100000,
        targets: ["FHD" as const],
        spec: {
          cpu: "AMD Ryzen",
          gpu: "RTX 4070",
          ram: "32GB",
          ssd: "1TB",
        },
        options: {
          ram: [{ label: "32GB", delta: 0 }],
        },
      };

      const result = createPCBuildSchema.safeParse(minimalBuild);
      expect(result.success).toBe(true);
    });

    it("should reject empty slug", () => {
      const build = { ...validBuild, slug: "" };
      const result = createPCBuildSchema.safeParse(build);

      expect(result.success).toBe(false);
    });

    it("should reject slug with uppercase", () => {
      const build = { ...validBuild, slug: "Gaming-PC" };
      const result = createPCBuildSchema.safeParse(build);

      expect(result.success).toBe(false);
    });

    it("should reject slug with spaces", () => {
      const build = { ...validBuild, slug: "gaming pc" };
      const result = createPCBuildSchema.safeParse(build);

      expect(result.success).toBe(false);
    });

    it("should reject slug longer than 100 characters", () => {
      const build = { ...validBuild, slug: "a".repeat(101) };
      const result = createPCBuildSchema.safeParse(build);

      expect(result.success).toBe(false);
    });

    it("should reject title shorter than 5 characters", () => {
      const build = { ...validBuild, title: "PC" };
      const result = createPCBuildSchema.safeParse(build);

      expect(result.success).toBe(false);
    });

    it("should reject title longer than 100 characters", () => {
      const build = { ...validBuild, title: "a".repeat(101) };
      const result = createPCBuildSchema.safeParse(build);

      expect(result.success).toBe(false);
    });

    it("should reject subtitle longer than 200 characters", () => {
      const build = { ...validBuild, subtitle: "a".repeat(201) };
      const result = createPCBuildSchema.safeParse(build);

      expect(result.success).toBe(false);
    });

    it("should reject invalid coverImageId format", () => {
      const build = { ...validBuild, coverImageId: "invalid-cuid" };
      const result = createPCBuildSchema.safeParse(build);

      expect(result.success).toBe(false);
    });

    it("should reject price below 10,000", () => {
      const build = { ...validBuild, priceBase: 9999 };
      const result = createPCBuildSchema.safeParse(build);

      expect(result.success).toBe(false);
    });

    it("should reject price above 10,000,000", () => {
      const build = { ...validBuild, priceBase: 10000001 };
      const result = createPCBuildSchema.safeParse(build);

      expect(result.success).toBe(false);
    });

    it("should accept price at boundary (10,000)", () => {
      const build = { ...validBuild, priceBase: 10000 };
      const result = createPCBuildSchema.safeParse(build);

      expect(result.success).toBe(true);
    });

    it("should accept price at boundary (10,000,000)", () => {
      const build = { ...validBuild, priceBase: 10000000 };
      const result = createPCBuildSchema.safeParse(build);

      expect(result.success).toBe(true);
    });

    it("should reject non-integer price", () => {
      const build = { ...validBuild, priceBase: 150000.50 };
      const result = createPCBuildSchema.safeParse(build);

      expect(result.success).toBe(false);
    });

    it("should reject empty targets array", () => {
      const build = { ...validBuild, targets: [] };
      const result = createPCBuildSchema.safeParse(build);

      expect(result.success).toBe(false);
    });

    it("should reject more than 3 targets", () => {
      const build = {
        ...validBuild,
        targets: ["FHD" as const, "QHD" as const, "UHD4K" as const, "FHD" as const]
      };
      const result = createPCBuildSchema.safeParse(build);

      expect(result.success).toBe(false);
    });

    it("should accept all 3 valid targets", () => {
      const build = {
        ...validBuild,
        targets: ["FHD" as const, "QHD" as const, "UHD4K" as const]
      };
      const result = createPCBuildSchema.safeParse(build);

      expect(result.success).toBe(true);
    });

    it("should reject invalid resolution in targets", () => {
      const build = { ...validBuild, targets: ["INVALID" as any] };
      const result = createPCBuildSchema.safeParse(build);

      expect(result.success).toBe(false);
    });

    it("should reject more than 10 gallery images", () => {
      const build = {
        ...validBuild,
        gallery: new Array(11).fill(validCUID)
      };
      const result = createPCBuildSchema.safeParse(build);

      expect(result.success).toBe(false);
    });

    it("should accept exactly 10 gallery images", () => {
      const build = {
        ...validBuild,
        gallery: new Array(10).fill(validCUID)
      };
      const result = createPCBuildSchema.safeParse(build);

      expect(result.success).toBe(true);
    });

    it("should reject more than 5 badges", () => {
      const build = {
        ...validBuild,
        badges: ["New", "Popular", "Hot", "Sale", "Limited", "Extra"]
      };
      const result = createPCBuildSchema.safeParse(build);

      expect(result.success).toBe(false);
    });

    it("should reject badge longer than 20 characters", () => {
      const build = {
        ...validBuild,
        badges: ["a".repeat(21)]
      };
      const result = createPCBuildSchema.safeParse(build);

      expect(result.success).toBe(false);
    });

    it("should accept valid availability statuses", () => {
      const statuses: Array<"IN_STOCK" | "PREORDER" | "OUT_OF_STOCK"> = [
        "IN_STOCK",
        "PREORDER",
        "OUT_OF_STOCK",
      ];

      statuses.forEach((status) => {
        const build = { ...validBuild, availability: status };
        const result = createPCBuildSchema.safeParse(build);
        expect(result.success).toBe(true);
      });
    });
  });

  describe("updatePCBuildSchema", () => {
    it("should validate update with partial fields", () => {
      const updateData = {
        title: "Updated Title",
        priceBase: 200000,
      };

      const result = updatePCBuildSchema.safeParse(updateData);
      expect(result.success).toBe(true);
    });

    it("should validate update with single field", () => {
      const updateData = {
        isTop: true,
      };

      const result = updatePCBuildSchema.safeParse(updateData);
      expect(result.success).toBe(true);
    });

    it("should reject empty update", () => {
      const updateData = {};

      const result = updatePCBuildSchema.safeParse(updateData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("хотя бы одно поле");
      }
    });

    it("should apply same validation rules as create", () => {
      const updateData = {
        title: "PC",
      };

      const result = updatePCBuildSchema.safeParse(updateData);
      expect(result.success).toBe(false);
    });
  });

  describe("pcBuildQuerySchema", () => {
    it("should validate empty query", () => {
      const query = {};
      const result = pcBuildQuerySchema.safeParse(query);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
        expect(result.data.limit).toBe(10);
        expect(result.data.sortOrder).toBe("desc");
      }
    });

    it("should coerce string page to number", () => {
      const query = { page: "2" };
      const result = pcBuildQuerySchema.safeParse(query);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(2);
        expect(typeof result.data.page).toBe("number");
      }
    });

    it("should coerce string limit to number", () => {
      const query = { limit: "20" };
      const result = pcBuildQuerySchema.safeParse(query);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.limit).toBe(20);
      }
    });

    it("should coerce string isTop to boolean", () => {
      const query = { isTop: "true" };
      const result = pcBuildQuerySchema.safeParse(query);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.isTop).toBe(true);
      }
    });

    it("should transform single target to array", () => {
      const query = { targets: "FHD" as any };
      const result = pcBuildQuerySchema.safeParse(query);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(Array.isArray(result.data.targets)).toBe(true);
        expect(result.data.targets).toEqual(["FHD"]);
      }
    });

    it("should accept array of targets", () => {
      const query = { targets: ["FHD", "QHD"] };
      const result = pcBuildQuerySchema.safeParse(query);

      expect(result.success).toBe(true);
    });

    it("should reject limit above 100", () => {
      const query = { limit: "101" };
      const result = pcBuildQuerySchema.safeParse(query);

      expect(result.success).toBe(false);
    });

    it("should reject negative page", () => {
      const query = { page: "-1" };
      const result = pcBuildQuerySchema.safeParse(query);

      expect(result.success).toBe(false);
    });

    it("should reject zero page", () => {
      const query = { page: "0" };
      const result = pcBuildQuerySchema.safeParse(query);

      expect(result.success).toBe(false);
    });

    it("should apply default values", () => {
      const query = {};
      const result = pcBuildQuerySchema.safeParse(query);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
        expect(result.data.limit).toBe(10);
        expect(result.data.sortOrder).toBe("desc");
      }
    });

    describe("refine: maxPrice > minPrice", () => {
      it("should reject maxPrice less than minPrice", () => {
        const query = {
          minPrice: "200000",
          maxPrice: "100000",
        };

        const result = pcBuildQuerySchema.safeParse(query);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toContain("больше");
        }
      });

      it("should reject maxPrice equal to minPrice", () => {
        const query = {
          minPrice: "100000",
          maxPrice: "100000",
        };

        const result = pcBuildQuerySchema.safeParse(query);
        expect(result.success).toBe(false);
      });

      it("should accept maxPrice greater than minPrice", () => {
        const query = {
          minPrice: "100000",
          maxPrice: "200000",
        };

        const result = pcBuildQuerySchema.safeParse(query);
        expect(result.success).toBe(true);
      });

      it("should pass if only minPrice provided", () => {
        const query = {
          minPrice: "100000",
        };

        const result = pcBuildQuerySchema.safeParse(query);
        expect(result.success).toBe(true);
      });

      it("should pass if only maxPrice provided", () => {
        const query = {
          maxPrice: "200000",
        };

        const result = pcBuildQuerySchema.safeParse(query);
        expect(result.success).toBe(true);
      });
    });
  });

  describe("ResolutionEnum", () => {
    it("should accept FHD", () => {
      const result = ResolutionEnum.safeParse("FHD");
      expect(result.success).toBe(true);
    });

    it("should accept QHD", () => {
      const result = ResolutionEnum.safeParse("QHD");
      expect(result.success).toBe(true);
    });

    it("should accept UHD4K", () => {
      const result = ResolutionEnum.safeParse("UHD4K");
      expect(result.success).toBe(true);
    });

    it("should reject invalid resolution", () => {
      const result = ResolutionEnum.safeParse("INVALID");
      expect(result.success).toBe(false);
    });
  });

  describe("AvailabilityEnum", () => {
    it("should accept IN_STOCK", () => {
      const result = AvailabilityEnum.safeParse("IN_STOCK");
      expect(result.success).toBe(true);
    });

    it("should accept PREORDER", () => {
      const result = AvailabilityEnum.safeParse("PREORDER");
      expect(result.success).toBe(true);
    });

    it("should accept OUT_OF_STOCK", () => {
      const result = AvailabilityEnum.safeParse("OUT_OF_STOCK");
      expect(result.success).toBe(true);
    });

    it("should reject invalid availability", () => {
      const result = AvailabilityEnum.safeParse("INVALID");
      expect(result.success).toBe(false);
    });
  });

  describe("generateSlug helper", () => {
    it("should generate slug from English title", () => {
      const result = generateSlug("Gaming PC RTX 4070 Super");
      expect(result).toBe("gaming-pc-rtx-4070-super");
    });

    it("should generate slug from Russian title", () => {
      const result = generateSlug("Игровой ПК");
      expect(result).toBe("igrovoi-pk");
    });

    it("should handle mixed languages", () => {
      const result = generateSlug("Gaming Компьютер");
      expect(result).toBe("gaming-kompyuter");
    });

    it("should remove special characters", () => {
      const result = generateSlug("PC @ 2024!");
      expect(result).toBe("pc-2024");
    });

    it("should replace spaces with dashes", () => {
      const result = generateSlug("Gaming PC");
      expect(result).toBe("gaming-pc");
    });

    it("should remove multiple consecutive dashes", () => {
      const result = generateSlug("Gaming---PC");
      expect(result).toBe("gaming-pc");
    });

    it("should convert to lowercase", () => {
      const result = generateSlug("GAMING PC");
      expect(result).toBe("gaming-pc");
    });

    it("should trim leading and trailing dashes", () => {
      const result = generateSlug("-Gaming PC-");
      expect(result).toBe("gaming-pc");
    });

    it("should normalize unicode characters", () => {
      const result = generateSlug("Café");
      expect(result).toBe("cafe");
    });

    it("should handle empty string", () => {
      const result = generateSlug("");
      expect(result).toBe("");
    });
  });

  describe("formatPrice helper", () => {
    const formatter = new Intl.NumberFormat("ru-RU", {
      style: "currency",
      currency: "RUB",
      maximumFractionDigits: 0,
    });

    it("should format price in Russian locale", () => {
      const result = formatPrice(150000);
      expect(result).toBe(formatter.format(150000));
    });

    it("should format small price", () => {
      const result = formatPrice(10000);
      expect(result).toBe(formatter.format(10000));
    });

    it("should format large price", () => {
      const result = formatPrice(10000000);
      expect(result).toBe(formatter.format(10000000));
    });

    it("should format price below 1000", () => {
      const result = formatPrice(999);
      expect(result).toBe(formatter.format(999));
    });
  });

  describe("parseSpec helper", () => {
    it("should parse spec string to object", () => {
      const specString = JSON.stringify({
        cpu: "AMD Ryzen 7",
        gpu: "RTX 4070",
        ram: "32GB",
        ssd: "1TB",
      });
      const result = parseSpec(specString);

      expect(result).toEqual({
        cpu: "AMD Ryzen 7",
        gpu: "RTX 4070",
        ram: "32GB",
        ssd: "1TB",
      });
    });

    it("should parse spec with all fields", () => {
      const specString = JSON.stringify({
        cpu: "Ryzen",
        gpu: "RTX",
        ram: "32GB",
        ssd: "1TB",
        motherboard: "ASUS",
        psu: "750W",
        cooling: "Arctic",
        case: "Lian Li",
      });
      const result = parseSpec(specString);

      expect(result.motherboard).toBe("ASUS");
      expect(result.psu).toBe("750W");
      expect(result.cooling).toBe("Arctic");
      expect(result.case).toBe("Lian Li");
    });

    it("should parse spec with minimal fields", () => {
      const specString = JSON.stringify({
        cpu: "Ryzen",
        gpu: "RTX",
        ram: "32GB",
        ssd: "1TB",
      });
      const result = parseSpec(specString);

      expect(result.motherboard).toBeUndefined();
      expect(result.psu).toBeUndefined();
    });
  });

  describe("parseOptions helper", () => {
    it("should parse options string to object", () => {
      const optionsString = JSON.stringify({
        ram: [
          { label: "16GB", delta: -3000 },
          { label: "32GB", delta: 0 },
        ],
        ssd: [
          { label: "1TB", delta: 0 },
          { label: "2TB", delta: 2000 },
        ],
      });
      const result = parseOptions(optionsString);

      expect(result).toEqual({
        ram: [
          { label: "16GB", delta: -3000 },
          { label: "32GB", delta: 0 },
        ],
        ssd: [
          { label: "1TB", delta: 0 },
          { label: "2TB", delta: 2000 },
        ],
      });
    });

    it("should parse single category", () => {
      const optionsString = JSON.stringify({
        ram: [{ label: "32GB", delta: 0 }],
      });
      const result = parseOptions(optionsString);

      expect(result).toEqual({
        ram: [{ label: "32GB", delta: 0 }],
      });
    });

    it("should parse all categories", () => {
      const optionsString = JSON.stringify({
        ram: [{ label: "32GB", delta: 0 }],
        ssd: [{ label: "1TB", delta: 0 }],
        gpu: [{ label: "RTX", delta: 5000 }],
        cooling: [{ label: "Air", delta: 0 }],
      });
      const result = parseOptions(optionsString);

      expect(Object.keys(result)).toHaveLength(4);
      expect(result.ram).toBeDefined();
      expect(result.ssd).toBeDefined();
      expect(result.gpu).toBeDefined();
      expect(result.cooling).toBeDefined();
    });
  });
});
