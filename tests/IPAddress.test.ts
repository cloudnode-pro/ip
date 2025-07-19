import {describe, expect, it} from "vitest";
import {IPAddress, IPv4, IPv6} from "../src/index.js";

describe("IPAddress", () => {
    describe("static fromString", () => {
        it("creates IPv4 from IPv4 string", () => {
            const ip = IPAddress.fromString("192.0.2.0");
            expect(ip).toBeInstanceOf(IPv4);
            expect(ip.toString()).toBe("192.0.2.0");
        });

        it("creates IPv6 from IPv6 string", () => {
            const ip = IPAddress.fromString("2001:db8::");
            expect(ip).toBeInstanceOf(IPv6);
            expect(ip.toString()).toBe("2001:db8::");
        });

        it("creates IPv4 from IPv4 string with resolveMapped=false", () => {
            const ip = IPAddress.fromString("192.0.2.0");
            expect(ip).toBeInstanceOf(IPv4);
            expect(ip.toString()).toBe("192.0.2.0");
        });

        it("creates IPv6 from IPv6 string with resolveMapped=true", () => {
            const ip = IPAddress.fromString("2001:db8::", true);
            expect(ip).toBeInstanceOf(IPv6);
            expect(ip.toString()).toBe("2001:db8::");
        });

        it("creates IPv4 from IPv4-mapped IPv6 string with resolveMapped=true", () => {
            const ip = IPAddress.fromString("::ffff:192.0.2.0", true);
            expect(ip).toBeInstanceOf(IPv4);
            expect(ip.toString()).toBe("192.0.2.0");
        });

        it("creates IPv6 from IPv4-mapped IPv6 string with resolveMapped=false", () => {
            const ip = IPAddress.fromString("::ffff:192.0.2.0");
            expect(ip).toBeInstanceOf(IPv6);
            expect(ip.toString()).toBe("::ffff:c000:200");
        });

        it("throws RangeError for invalid string", () => {
            expect(() => IPAddress.fromString("not an ip")).toThrow(RangeError);
            expect(() => IPAddress.fromString("invalid:ip")).toThrow(RangeError);
            expect(() => IPAddress.fromString("not.an.ip")).toThrow(RangeError);
            expect(() => IPAddress.fromString("")).toThrow(RangeError);
        });
    });
});
