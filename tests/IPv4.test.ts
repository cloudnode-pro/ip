import {describe, expect, it} from "vitest";
import {IPv4, IPv6} from "../src/index.js";

describe("IPv4", () => {
    describe("static BIT_LENGTH", () => {
        it("is 32", () => {
            expect(IPv4.BIT_LENGTH).toBe(32);
        });
    });

    describe("constructor", () => {
        it("constructs from a valid number", () => {
            const ip = new IPv4(0xC0000200);
            expect(ip.value).toBe(0xC0000200n);
            expect(ip.toString()).toBe("192.0.2.0");
        });

        it("constructs from a valid bigint", () => {
            const ip = new IPv4(0xC6336410n);
            expect(ip.value).toBe(0xC6336410n);
            expect(ip.toString()).toBe("198.51.100.16");
        });

        it("constructs from 0", () => {
            const ip = new IPv4(0);
            expect(ip.value).toBe(0n);
            expect(ip.toString()).toBe("0.0.0.0");
        });

        it("constructs from 2^32 - 1", () => {
            const ip = new IPv4(2 ** 32 - 1);
            expect(ip.value).toBe(2n ** 32n - 1n);
            expect(ip.toString()).toBe("255.255.255.255");
        });

        it("throws TypeError for value < 0", () => {
            expect(() => new IPv4(-1)).toThrow(TypeError);
            expect(() => new IPv4(-1n)).toThrow(TypeError);
        });

        it("throws TypeError for value > 2^32 - 1", () => {
            expect(() => new IPv4(2 ** 32)).toThrow(TypeError);
            expect(() => new IPv4(2n ** 32n)).toThrow(TypeError);
        });
    });

    describe("static fromBinary", () => {
        it("creates IPv4 from 4-octet array", () => {
            const ip = IPv4.fromBinary(new Uint8Array([192, 0, 2, 0]));
            expect(ip.toString()).toBe("192.0.2.0");
        });

        it("throws RangeError if array has less than 4 octets", () => {
            expect(() => IPv4.fromBinary(new Uint8Array([192, 0, 2]))).toThrow(RangeError);
        });

        it("throws RangeError if array has more than 4 octets", () => {
            expect(() => IPv4.fromBinary(new Uint8Array([192, 0, 2, 1, 0]))).toThrow(RangeError);
        });
    });

    describe("static fromString", () => {
        it("creates IPv4 from valid string", () => {
            const ip = IPv4.fromString("203.0.113.5");
            expect(ip.value).toBe(0xCB007105n);
        });

        it("throws RangeError for invalid IP string", () => {
            expect(() => IPv4.fromString("256.0.0.0")).toThrow(RangeError);
            expect(() => IPv4.fromString("10")).toThrow(RangeError);
            expect(() => IPv4.fromString("invalid.ip.string")).toThrow(RangeError);
        });
    });

    describe("binary", () => {
        it("returns correct 4-octet array", () => {
            const ip = IPv4.fromString("192.0.2.5");
            expect(Array.from(ip.binary())).toEqual([192, 0, 2, 5]);
        });
    });

    describe("[Symbol.toPrimitive]", () => {
        it("returns dotted-decimal string when hint is string", () => {
            const ip = IPv4.fromString("192.0.2.0");
            expect(`${ip}`).toBe("192.0.2.0");
        });

        it("returns number when hint is not string", () => {
            const ip = IPv4.fromString("192.0.2.0");
            expect(1n + (ip as unknown as bigint)).toBe(0xC0000201n);
            expect(BigInt(ip as unknown as bigint)).toBe(0xC0000200n);
        });
    });

    describe("toString", () => {
        it("returns dotted-decimal string", () => {
            const ip = IPv4.fromString("203.0.113.42");
            expect(ip.toString()).toBe("203.0.113.42");
        });
    });

    describe("equals", () => {
        it("returns true for two IPv4 instances with the same address", () => {
            const a = IPv4.fromString("198.51.100.10");
            const b = IPv4.fromString("198.51.100.10");
            expect(a.equals(b)).toBe(true);
        });

        it("returns false for two IPv4 instances with different addresses", () => {
            const a = IPv4.fromString("198.51.100.10");
            const b = IPv4.fromString("198.51.100.11");
            expect(a.equals(b)).toBe(false);
        });

        it("returns false when compared with a different IPAddress subclass", () => {
            const a = IPv4.fromString("198.51.100.10");
            const b = IPv6.fromString("::c633:640a");

            expect(a.equals(b)).toBe(false);
        });
    });

    describe("offset", () => {
        it("offsets positively", () => {
            const ip = IPv4.fromString("192.0.2.1");
            expect(ip.offset(1).toString()).toBe("192.0.2.2");
            expect(ip.offset(1n).toString()).toBe("192.0.2.2");
            expect(ip.offset(104030719).toString()).toBe("198.51.100.0");
            expect(ip.offset(104030719n).toString()).toBe("198.51.100.0");
        });

        it("offsets negatively", () => {
            const ip = IPv4.fromString("203.0.113.1");
            expect(ip.offset(-1).toString()).toBe("203.0.113.0");
            expect(ip.offset(-1n).toString()).toBe("203.0.113.0");
            expect(ip.offset(-80547073).toString()).toBe("198.51.100.0");
            expect(ip.offset(-80547073n).toString()).toBe("198.51.100.0");
        });

        it("throws TypeError if offset IP < 0", () => {
            const ip = IPv4.fromString("192.0.2.0");
            expect(() => ip.offset(-3221225985)).toThrow(TypeError);
        });

        it("throws TypeError if offset IP > 2^32 - 1", () => {
            const ip = IPv4.fromString("203.0.113.0");
            expect(() => ip.offset(889163520)).toThrow(TypeError);
        });
    });
});
