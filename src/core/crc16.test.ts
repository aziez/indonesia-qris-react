import { describe, expect, test } from "bun:test";
import { calculateCRC16, verifyCRC } from "./crc16";

describe("CRC16 Utilities", () => {
  // A standard mock QRIS payload WITHOUT the CRC value at the end
  const mockPayload = "00020101021126570011ID.DANA.WWW011893600915316401662902152006153164016620303UMO51440014ID.CO.QRIS.WWW0215ID10200843339090303UMO5204581253033605802ID5912Warung Sayur6007JAKARTA6304";
  
  // A full QRIS string WITH the expected CRC at the end
  // (Note: The actual CRC here is just an example. Let's calculate the real one for the mockPayload first.)
  const expectedCrc = calculateCRC16(mockPayload);
  const fullQrisString = mockPayload + expectedCrc;

  test("calculateCRC16 should generate a 4-character hex string", () => {
    const crc = calculateCRC16(mockPayload);
    expect(crc).toBeTypeOf("string");
    expect(crc).toHaveLength(4);
    // Ensure it's uppercase hex
    expect(/^[0-9A-F]{4}$/.test(crc)).toBe(true);
  });

  test("verifyCRC should return true for a valid QRIS string", () => {
    expect(verifyCRC(fullQrisString)).toBe(true);
  });

  test("verifyCRC should return false if the CRC is tampered", () => {
    const tamperedQris = mockPayload + "0000";
    expect(verifyCRC(tamperedQris)).toBe(false);
  });
  
  test("verifyCRC should return false for strings shorter than 4 chars", () => {
    expect(verifyCRC("123")).toBe(false);
  });
});
