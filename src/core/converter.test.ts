import { describe, expect, test } from "bun:test";
import { staticToDynamic } from "./converter";
import { parseQRIS, parseTLV } from "./parser";
import { calculateCRC16 } from "./crc16";

describe("Converter Utilities", () => {
  const basePayload = "0002010102115204581253033605802ID5912Warung Sayur6007JAKARTA6304";
  const validStaticQris = basePayload + calculateCRC16(basePayload);

  test("staticToDynamic should inject amount and change method", () => {
    const amount = 50000;
    const dynamicQris = staticToDynamic(validStaticQris, { amount });
    
    // Parse the result
    const parsed = parseQRIS(dynamicQris);
    
    expect(parsed.method).toBe("dynamic");
    expect(parsed.amount).toBe(amount);
    
    // The raw tags should now contain tag 54 (amount) before 58
    const tag54 = parsed.raw.find(t => t.tag === "54");
    expect(tag54).toBeDefined();
    expect(tag54?.value).toBe(amount.toString());
  });

  test("staticToDynamic should throw if amount is invalid", () => {
    expect(() => staticToDynamic(validStaticQris, { amount: 0 })).toThrow("Amount must be greater than 0");
  });

  test("staticToDynamic should throw if already dynamic", () => {
    const dynamicQris = staticToDynamic(validStaticQris, { amount: 10000 });
    expect(() => staticToDynamic(dynamicQris, { amount: 20000 })).toThrow("QRIS payload is already dynamic");
  });

  test("staticToDynamic should inject fee and tip", () => {
    const dynamicQris = staticToDynamic(validStaticQris, { 
      amount: 10000,
      fee: { type: 'fixed', value: 2000 }
    });
    
    const parsed = parseQRIS(dynamicQris);
    
    const tag55 = parsed.raw.find(t => t.tag === "55");
    const tag56 = parsed.raw.find(t => t.tag === "56");
    
    expect(tag55?.value).toBe("02"); // Tip indicator (fixed)
    expect(tag56?.value).toBe("2000"); // Fee value
  });

  test("staticToDynamic should inject merchantRef into tag 62", () => {
    const dynamicQris = staticToDynamic(validStaticQris, { 
      amount: 10000,
      merchantRef: "INV-123"
    });
    
    const parsed = parseQRIS(dynamicQris);
    const tag62 = parsed.raw.find(t => t.tag === "62");
    expect(tag62).toBeDefined();
    
    // Parse the nested tag 62 value to find tag 05
    const tag62Children = parseTLV(tag62!.value);
    const tag05 = tag62Children.find(t => t.tag === "05");
    
    expect(tag05).toBeDefined();
    expect(tag05?.value).toBe("INV-123");
  });
});
