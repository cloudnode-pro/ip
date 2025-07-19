import {describe, expect, it} from "vitest";
import {IPv4, IPv6} from "../src/index.js";

describe("IPv6", () => {
    describe("static BIT_LENGTH", () => {
        it("is 128", () => {
            expect(IPv6.BIT_LENGTH).toBe(128);
        });
    });

    describe("constructor", () => {
        it("constructs from a valid 128-bit bigint", () => {
            const ip = new IPv6(0x20010db8000000000000000000000001n);
            expect(ip.value).toBe(0x20010db8000000000000000000000001n);
            expect(ip.toString()).toBe("2001:db8::1");
        });

        it("throws TypeError if value is negative", () => {
            expect(() => new IPv6(-1n)).toThrow(TypeError);
        });

        it("throws TypeError if value > 2^128 - 1", () => {
            expect(() => new IPv6(2n ** 128n)).toThrow(TypeError);
        });
    });

    describe("static fromBinary", () => {
        it("creates IPv6 from 8 hextets", () => {
            const ip = IPv6.fromBinary(new Uint16Array([0x2001, 0xdb8, 0, 0, 0, 0, 0, 0x1]));
            expect(ip.toString()).toBe("2001:db8::1");
        });

        it("throws RangeError if array has less than 8 hextets", () => {
            expect(() => IPv6.fromBinary(new Uint16Array([0x2001, 0xdb8, 0, 0, 0, 0, 0x1]))).toThrow(RangeError);
        });

        it("throws RangeError if array has more than 8 hextets", () => {
            expect(() => IPv6.fromBinary(new Uint16Array([0x2001, 0xdb8, 0, 0, 0, 0, 0, 0, 0x1])))
                .toThrow(RangeError);
        });
    });

    describe("static fromString", () => {
        it("creates IPv6 from valid compressed string", () => {
            const ip = IPv6.fromString("2001:db8::5");
            expect(ip.toString()).toBe("2001:db8::5");
        });

        it("creates IPv6 from valid full string", () => {
            const ip = IPv6.fromString("2001:0db8:0000:0000:0000:0000:0000:0001");
            expect(ip.toString()).toBe("2001:db8::1");
        });

        it("throws RangeError for invalid IPv6 string", () => {
            expect(() => IPv6.fromString("invalid::ip")).toThrow(RangeError);
            expect(() => IPv6.fromString("12345::")).toThrow(RangeError);
            expect(() => IPv6.fromString("2001:0db8:0000:0000:0000:0000:0000:ffff2")).toThrow(RangeError);
            expect(() => IPv6.fromString("2001:0db8:0000:0000:0000:0000:0001")).toThrow(RangeError);
        });
    });

    describe("binary", () => {
        it("returns correct 8-hextet array", () => {
            expect(Array.from(IPv6.fromString("2001:db8::").binary())).toEqual([0x2001, 0xdb8, 0, 0, 0, 0, 0, 0]);
            expect(Array.from(IPv6.fromString("2001:db8:dead:beef::1337:cafe").binary()))
                .toEqual([0x2001, 0xdb8, 0xdead, 0xbeef, 0, 0, 0x1337, 0xcafe]);
        });
    });

    describe("hasMappedIPv4", () => {
        it("returns true for ::ffff:192.0.2.0", () => {
            const ip = IPv6.fromString("::ffff:192.0.2.0");
            expect(ip.hasMappedIPv4()).toBe(true);
        });

        it("returns true for ::ffff:c633:642a", () => {
            const ip = IPv6.fromString("::ffff:c633:642a");
            expect(ip.hasMappedIPv4()).toBe(true);
        });

        it("returns false for non-mapped IPv6 address", () => {
            const ip = IPv6.fromString("2001:db8::1");
            expect(ip.hasMappedIPv4()).toBe(false);
        });
    });

    describe("getMappedIPv4", () => {
        it("returns the mapped IPv4 address from ::ffff:192.0.2.0", () => {
            const ip = IPv6.fromString("::ffff:192.0.2.0");
            const mapped = ip.getMappedIPv4();
            expect(mapped.toString()).toBe("192.0.2.0");
        });
        it("returns the mapped IPv4 address from ::ffff:c633:642a", () => {
            const ip = IPv6.fromString("::ffff:c633:642a");
            const mapped = ip.getMappedIPv4();
            expect(mapped.toString()).toBe("198.51.100.42");
        });
    });

    describe("toString", () => {
        it("returns canonical string form", () => {
            const ip = IPv6.fromString("2001:0db8:0000:0000:0000:0000:0000:0001");
            expect(ip.toString()).toBe("2001:db8::1");
        });

        it("returns full uncompressed IPv6 string when no zeros to compress", () => {
            const ip = IPv6.fromString("2001:0db8:1234:5678:9abc:def:0123:4567");
            expect(ip.toString()).toBe("2001:db8:1234:5678:9abc:def:123:4567");
        });

        it("collapses the first longest zero group", () => {
            const hextets = new Uint16Array([0x2001, 0xdb8, 0, 0, 0x1, 0, 0, 0x1]);
            const ip = IPv6.fromBinary(hextets);
            expect(ip.toString()).toBe("2001:db8::1:0:0:1");
        });

        it("does not compress a single zero hextet", () => {
            const hextets = new Uint16Array([0x2001, 0xdb8, 0, 0x1, 0, 0x1234, 0xabcd, 0x5678]);
            const ip = IPv6.fromBinary(hextets);
            expect(ip.toString()).toBe("2001:db8:0:1:0:1234:abcd:5678");
        });

        it("returns :: for the unspecified address", () => {
            const ip = new IPv6(0n);
            expect(ip.toString()).toBe("::");
        });
    });

    describe("equals", () => {
        it("returns true for two equal IPv6 addresses", () => {
            const a = IPv6.fromString("2001:db8::5");
            const b = IPv6.fromString("2001:db8::5");
            expect(a.equals(b)).toBe(true);
        });

        it("returns false for different IPv6 addresses", () => {
            const a = IPv6.fromString("2001:db8::1");
            const b = IPv6.fromString("2001:db8::2");
            expect(a.equals(b)).toBe(false);
        });

        it("returns false when compared with different IPAddress subclass", () => {
            const a = IPv6.fromString("::cb00:71ff");
            const b = IPv4.fromString("203.0.113.255");
            expect(a.equals(b)).toBe(false);
        });
    });

    describe("offset", () => {
        it("offsets positively", () => {
            expect(IPv6.fromString("2001:db8::").offset(1).toString()).toBe("2001:db8::1");
            expect(IPv6.fromString("2001:db8::").offset(5634002667680789686395290983n).toString())
                .toBe("2001:db8:1234:5678:9abc:def:123:4567");
        });

        it("offsets negatively", () => {
            expect(IPv6.fromString("2001:db8::1").offset(-1).toString()).toBe("2001:db8::");
            expect(IPv6.fromString("2001:db8::cafe:babe").offset(-270593984n).toString())
                .toBe("2001:db8::badd:cafe");
        });

        it("throws TypeError if offset IP < 0", () => {
            expect(() => IPv6.fromString("::").offset(-1)).toThrow(TypeError);
            expect(() => IPv6.fromString("2001:db8::cafe:babe")
                .offset(-42540766411282592856903984955059518143n)).toThrow(TypeError);
        });

        it("throws TypeError if offset IP > 2^128 - 1", () => {
            expect(() => new IPv6(2n ** 128n - 1n).offset(1)).toThrow(TypeError);
            expect(() => IPv6.fromString("2001:db8::dead:beef")
                .offset(297741600509655870606470622476378456337n)).toThrow(TypeError);
        });
    });
});
