import {describe, expect, it} from "vitest";
import {IPv4, IPv6, Subnet} from "../src/index.js";

describe("Subnet", () => {
    describe("constructor", () => {
        it("creates a subnet with valid IPv4 address and prefix", () => {
            const addr = IPv4.fromString("192.0.2.0");
            const subnet = new Subnet(addr, 24);
            expect(subnet.address.equals(addr)).toBe(true);
            expect(subnet.prefix).toBe(24);
        });

        it("creates a subnet with misaligned address", () => {
            const addr = IPv4.fromString("192.0.2.42");
            const subnet = new Subnet(addr, 24);
            expect(subnet.address.equals(IPv4.fromString("192.0.2.0"))).toBe(true);
        });

        it("throws RangeError if prefix length exceeds IP bit length", () => {
            expect(() => new Subnet(IPv4.fromString("192.0.2.0"), 33)).toThrow(RangeError);
            expect(() => new Subnet(IPv6.fromString("2001:db8::"), 129)).toThrow(RangeError);
        });

        it("throws RangeError if prefix length is negative", () => {
            expect(() => new Subnet(IPv4.fromString("192.0.2.0"), -1)).toThrow(RangeError);
        });
    });

    describe("static fromCIDR", () => {
        it("creates subnet from valid IPv4 CIDR string", () => {
            const subnet = Subnet.fromCIDR("192.0.2.0/24");
            expect(subnet.address.toString()).toBe("192.0.2.0");
            expect(subnet.prefix).toBe(24);
        });

        it("throws RangeError on invalid CIDR string", () => {
            expect(() => Subnet.fromCIDR("192.0.2.0/33")).toThrow(RangeError);
            expect(() => Subnet.fromCIDR("192.0.2.0")).toThrow(RangeError);
            expect(() => Subnet.fromCIDR("192.0.2.0/no")).toThrow(RangeError);
            expect(() => Subnet.fromCIDR("10/8")).toThrow(RangeError);
            expect(() => Subnet.fromCIDR("10.0/16")).toThrow(RangeError);
            expect(() => Subnet.fromCIDR("invalid/cidr")).toThrow(RangeError);
        });
    });

    describe("static range", () => {
        it("creates subnet from /24 IPv4 range", () => {
            const subnets = Subnet.range(
                IPv4.fromString("192.0.2.0"),
                IPv4.fromString("192.0.2.255")
            );
            expect(subnets.map(s => s.toString())).toEqual(["192.0.2.0/24"]);
        });

        it("creates subnet from misaligned IPv4 range", () => {
            const subnets = Subnet.range(
                IPv4.fromString("192.0.2.0"),
                IPv4.fromString("198.51.100.255")
            );

            // from https://account.arin.net/public/cidrCalculator
            expect(subnets.map(s => s.toString())).toEqual([
                "192.0.2.0/23",
                "192.0.4.0/22",
                "192.0.8.0/21",
                "192.0.16.0/20",
                "192.0.32.0/19",
                "192.0.64.0/18",
                "192.0.128.0/17",
                "192.1.0.0/16",
                "192.2.0.0/15",
                "192.4.0.0/14",
                "192.8.0.0/13",
                "192.16.0.0/12",
                "192.32.0.0/11",
                "192.64.0.0/10",
                "192.128.0.0/9",
                "193.0.0.0/8",
                "194.0.0.0/7",
                "196.0.0.0/7",
                "198.0.0.0/11",
                "198.32.0.0/12",
                "198.48.0.0/15",
                "198.50.0.0/16",
                "198.51.0.0/18",
                "198.51.64.0/19",
                "198.51.96.0/22",
                "198.51.100.0/24",
            ]);
        });
    });

    describe("netmask", () => {
        it("returns correct netmask for IPv4 /24", () => {
            const subnet = Subnet.fromCIDR("192.0.2.0/24");
            expect(subnet.netmask()).toBe(0xffffff00n);
        });
    });

    describe("wildcard", () => {
        it("returns correct wildcard for IPv4 /24", () => {
            const subnet = Subnet.fromCIDR("192.0.2.0/24");
            expect(subnet.wildcard()).toBe(0xffn);
        });
    });

    describe("size", () => {
        it("returns correct size for IPv4 /24 subnet", () => {
            const subnet = Subnet.fromCIDR("192.0.2.0/24");
            expect(subnet.size()).toBe(256n);
        });

        it("returns correct size for IPv6 /32 subnet", () => {
            const subnet = Subnet.fromCIDR("2001:db8::/32");
            expect(subnet.size()).toBe(2n ** 96n);
        });
    });

    describe("contains", () => {
        const subnet = Subnet.fromCIDR("192.0.2.0/24");

        it("contains address inside subnet", () => {
            const addr = IPv4.fromString("192.0.2.42");
            expect(subnet.contains(addr)).toBe(true);
        });

        it("does not contain address outside subnet", () => {
            const addr = IPv4.fromString("198.51.100.10");
            expect(subnet.contains(addr)).toBe(false);
        });
    });

    describe("containsSubnet", () => {
        const subnet = Subnet.fromCIDR("192.0.2.0/24");

        it("contains smaller subnet inside", () => {
            const smaller = Subnet.fromCIDR("192.0.2.128/25");
            expect(subnet.containsSubnet(smaller)).toBe(true);
        });

        it("does not contain larger subnet", () => {
            const larger = Subnet.fromCIDR("192.0.2.0/23");
            expect(subnet.containsSubnet(larger)).toBe(false);
        });

        it("does not contain adjacent subnet", () => {
            const adjacent = Subnet.fromCIDR("192.0.3.0/25");
            expect(subnet.containsSubnet(adjacent)).toBe(false);
        });
    });

    describe("at", () => {
        const subnet = Subnet.fromCIDR("192.0.2.4/30");

        it("returns first address at index 0", () => {
            expect(subnet.at(0).toString()).toBe("192.0.2.4");
        });

        it("returns second address at index 1", () => {
            expect(subnet.at(1)?.toString()).toBe("192.0.2.5");
        });

        it("returns last address at index -1", () => {
            expect(subnet.at(-1).toString()).toBe("192.0.2.7");
        });

        it("returns penultimate address at index -2", () => {
            expect(subnet.at(-2)?.toString()).toBe("192.0.2.6");
        });

        it("returns undefined for out-of-range positive index", () => {
            expect(subnet.at(4)).toBeUndefined();
        });

        it("returns undefined for out-of-range negative index", () => {
            expect(subnet.at(-5)).toBeUndefined();
        });
    });

    describe("addresses", () => {
        const subnet = Subnet.fromCIDR("192.0.2.8/30");

        it("iterates over all addresses", () => {
            const ips = Array.from(subnet.addresses()).map(ip => ip.toString());
            expect(ips).toEqual(["192.0.2.8", "192.0.2.9", "192.0.2.10", "192.0.2.11"]);
        });
    });

    describe("[Symbol.iterator]", () => {
        const subnet = Subnet.fromCIDR("198.51.100.40/30");
        it("iterator works with for...of", () => {
            const ips: string[] = [];
            for (const ip of subnet)
                ips.push(ip.toString());
            expect(ips).toEqual(["198.51.100.40", "198.51.100.41", "198.51.100.42", "198.51.100.43"]);
        });
    })

    describe("set", () => {
        const subnet = Subnet.fromCIDR("192.0.2.0/30");

        it("creates a set of all addresses", () => {
            const set = subnet.set();
            expect(set.size).toBe(4);
            const arr = Array.from(set).map(ip => ip.toString());
            expect(arr).toEqual(["192.0.2.0", "192.0.2.1", "192.0.2.2", "192.0.2.3"]);
        });
    });

    describe("toString", () => {
        const subnet = Subnet.fromCIDR("192.0.2.0/24");

        it("returns CIDR notation string", () => {
            expect(subnet.toString()).toBe("192.0.2.0/24");
        });
    });

    describe("isAdjacent", () => {
        const subnet1 = Subnet.fromCIDR("192.0.2.0/25");
        const subnet2 = Subnet.fromCIDR("192.0.2.128/25");
        const subnet3 = Subnet.fromCIDR("198.51.100.0/25");

        it("returns true for adjacent subnets", () => {
            expect(subnet1.isAdjacent(subnet2)).toBe(true);
        });

        it("returns false for non-adjacent subnets", () => {
            expect(subnet1.isAdjacent(subnet3)).toBe(false);
        });

        it("throws TypeError for different families", () => {
            const ipv6Subnet = Subnet.fromCIDR("2001:db8::/64");
            expect(() => subnet1.isAdjacent(ipv6Subnet)).toThrow(TypeError);
        });
    });

    describe("canMerge", () => {
        const subnet1 = Subnet.fromCIDR("192.0.2.0/25");
        const subnet2 = Subnet.fromCIDR("192.0.2.128/25");
        const subnet3 = Subnet.fromCIDR("192.0.2.0/26");

        it("returns true for adjacent subnets of same size", () => {
            expect(subnet1.canMerge(subnet2)).toBe(true);
        });

        it("returns false for subnets with different prefix length", () => {
            expect(subnet1.canMerge(subnet3)).toBe(false);
        });

        it("returns false for different families", () => {
            const ipv6Subnet = Subnet.fromCIDR("2001:db8::/25");
            expect(subnet1.canMerge(ipv6Subnet)).toBe(false);
        });
    });

    describe("merge", () => {
        const subnet1 = Subnet.fromCIDR("192.0.2.0/25");
        const subnet2 = Subnet.fromCIDR("192.0.2.128/25");

        it("merges adjacent subnets of same size", () => {
            const merged = subnet1.merge(subnet2);
            expect(merged.prefix).toBe(24);
            expect(merged.address.toString()).toBe("192.0.2.0");
        });

        it("merges when this is the upper neighbour", () => {
            const merged = subnet2.merge(subnet1);
            expect(merged.prefix).toBe(24);
            expect(merged.address.toString()).toBe("192.0.2.0");
        });

        it("throws TypeError for different families", () => {
            const ipv6Subnet = Subnet.fromCIDR("2001:db8::/25");
            expect(() => subnet1.merge(ipv6Subnet)).toThrow(TypeError);
        });

        it("throws TypeError for different sizes", () => {
            const subnet3 = Subnet.fromCIDR("192.0.2.128/26");
            expect(() => subnet1.merge(subnet3)).toThrow(TypeError);
        });

        it("throws RangeError for non-adjacent subnets", () => {
            const subnet3 = Subnet.fromCIDR("198.51.100.0/25");
            expect(() => subnet1.merge(subnet3)).toThrow(RangeError);
        });
    });

    describe("split", () => {
        const subnet = Subnet.fromCIDR("192.0.2.0/24");

        it("splits subnet into smaller subnets", () => {
            const splits = subnet.split(26).map(s => s.toString());
            expect(splits).toEqual([
                "192.0.2.0/26",
                "192.0.2.64/26",
                "192.0.2.128/26",
                "192.0.2.192/26",
            ]);
        });

        it("throws RangeError if prefix length is smaller than current", () => {
            expect(() => subnet.split(16)).toThrow(RangeError);
        });

        it("throws RangeError if prefix length exceeds IP bit length", () => {
            expect(() => subnet.split(33)).toThrow(RangeError);
        });
    });

    describe("subtract", () => {
        const subnet = Subnet.fromCIDR("192.0.2.0/24");

        it("subtracts a subnet fully contained", () => {
            const toSubtract = Subnet.fromCIDR("192.0.2.0/26");
            const result = subnet.subtract(toSubtract).map(s => s.toString());
            expect(result).toEqual([
                "192.0.2.64/26",
                "192.0.2.128/25",
            ]);
        });

        it("subtracts subnet not aligned with base address", () => {
            const toSubtract = Subnet.fromCIDR("192.0.2.128/26");
            const result = subnet.subtract(toSubtract).map(s => s.toString());
            expect(result).toEqual([
                "192.0.2.0/25",
                "192.0.2.192/26",
            ]);
        });

        it("returns self when subtracting non-overlapping subnet", () => {
            const toSubtract = Subnet.fromCIDR("198.51.100.0/25");
            const result = subnet.subtract(toSubtract);
            expect(result).toEqual([subnet]);
        });

        it("returns empty array when fully covered", () => {
            expect(subnet.subtract(Subnet.fromCIDR("192.0.2.0/24"))).toHaveLength(0);
            expect(subnet.subtract(Subnet.fromCIDR("0.0.0.0/0"))).toHaveLength(0);
        });

        it("throws TypeError for different family", () => {
            const ipv6Subnet = Subnet.fromCIDR("2001:db8::/64");
            expect(() => subnet.subtract(ipv6Subnet)).toThrow(TypeError);
        });
    });

    describe("equals", () => {
        it("returns true for identical subnets", () => {
            expect(Subnet.fromCIDR("192.0.2.0/24").equals(Subnet.fromCIDR("192.0.2.0/24")))
                .toBe(true);
            expect(Subnet.fromCIDR("2001:db8::/64").equals(Subnet.fromCIDR("2001:db8::/64")))
                .toBe(true);
        });

        it("returns false for different subnets", () => {
            expect(Subnet.fromCIDR("192.0.2.0/24").equals(Subnet.fromCIDR("192.0.2.0/25")))
                .toBe(false);
            expect(Subnet.fromCIDR("192.0.2.0/24").equals(Subnet.fromCIDR("2001:db8::/64")))
                .toBe(false);
        });
    });
});
