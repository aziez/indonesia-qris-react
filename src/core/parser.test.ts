import { describe, expect, test } from "bun:test";
import { parseTLV, parseQRIS } from "./parser";
import { calculateCRC16 } from "./crc16";

describe("Parser Utilities", () => {
  const basePayload = "0002010102115204581253033605802ID5912Warung Sayur6007JAKARTA6304";
  const validQris = basePayload + calculateCRC16(basePayload);

  test("parseTLV should extract tags correctly", () => {
    const tags = parseTLV(validQris);
    
    // Tag 00: 01
    const tag00 = tags.find((t) => t.tag === "00");
    expect(tag00?.value).toBe("01");
    expect(tag00?.length).toBe(2);

    // Tag 59: Warung Sayur
    const tag59 = tags.find((t) => t.tag === "59");
    expect(tag59?.value).toBe("Warung Sayur");
    expect(tag59?.length).toBe(12);
  });

  test("parseQRIS should throw error on invalid CRC", () => {
    const invalidQris = basePayload + "0000";
    expect(() => parseQRIS(invalidQris)).toThrow("Invalid QRIS CRC checksum.");
  });

  test("parseQRIS should parse into readable object", () => {
    const parsed = parseQRIS(validQris);
    expect(parsed.version).toBe("01");
    expect(parsed.method).toBe("static");
    expect(parsed.merchantName).toBe("Warung Sayur");
    expect(parsed.merchantCity).toBe("JAKARTA");
    expect(parsed.currency).toBe("360");
    expect(parsed.countryCode).toBe("ID");
    expect(parsed.amount).toBeUndefined(); // It's static, no amount
  });
});
