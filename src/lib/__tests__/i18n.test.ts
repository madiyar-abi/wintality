import { describe, it, expect } from "vitest";
import { dictionaries } from "../i18n/dictionaries";

describe("i18n Multilingual Dictionaries", () => {
  it("should contain kz, ru, and en dictionaries", () => {
    expect(dictionaries.kz).toBeDefined();
    expect(dictionaries.ru).toBeDefined();
    expect(dictionaries.en).toBeDefined();
  });

  it("should have identical root keys across all three languages", () => {
    const kzKeys = Object.keys(dictionaries.kz).sort();
    const ruKeys = Object.keys(dictionaries.ru).sort();
    const enKeys = Object.keys(dictionaries.en).sort();

    expect(kzKeys).toEqual(ruKeys);
    expect(ruKeys).toEqual(enKeys);
  });

  it("should have matching navigation labels in each language", () => {
    expect(dictionaries.kz.nav.catalog).toBe("Мүмкіндіктер каталогы");
    expect(dictionaries.ru.nav.catalog).toBe("Каталог возможностей");
    expect(dictionaries.en.nav.catalog).toBe("Opportunities Catalog");
  });

  it("should have matching dashboard section keys", () => {
    expect(dictionaries.kz.dashboard.title).toBeTruthy();
    expect(dictionaries.ru.dashboard.title).toBeTruthy();
    expect(dictionaries.en.dashboard.title).toBeTruthy();
  });
});
