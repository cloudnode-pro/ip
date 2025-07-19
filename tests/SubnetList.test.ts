import {describe, expect, it} from "vitest";
import {IPv4, IPv6, Subnet, SubnetList} from "../src/index.js";

describe("SubnetList", () => {
    describe("constructor", () => {
        it("creates empty SubnetList", () => {
            const list = new SubnetList();
            expect(list.size()).toBe(0n);
            expect(list.subnets()).toHaveLength(0);
        });

        it("initialises with provided subnets", () => {
            const s1 = Subnet.fromCIDR("192.0.2.0/25");
            const s2 = Subnet.fromCIDR("192.0.2.128/25");
            const s3 = Subnet.fromCIDR("198.51.100.0/24");
            const list = new SubnetList([s2, s1, s3]);
            expect(list.hasSubnet(s1)).toBe(true);
            expect(list.hasSubnet(s2)).toBe(true);
            expect(list.hasSubnet(s3)).toBe(true);
            expect(list.size()).toBeLessThanOrEqual(s1.size() + s2.size() + s3.size());
        });

        it("optimises subnets to minimise memory usage", () => {
            const s1 = Subnet.fromCIDR("192.0.2.0/25");
            const s2 = Subnet.fromCIDR("192.0.2.128/25");
            const s3 = Subnet.fromCIDR("198.51.100.0/24");
            const list = new SubnetList([s1, s2, s3]);
            expect(list.subnets().map(s => s.toString())).toEqual([
                "192.0.2.0/24",
                "198.51.100.0/24",
            ]);
        })
    });

    describe("add", () => {
        it("adds a subnet and returns true if new", () => {
            const s1 = Subnet.fromCIDR("192.0.2.0/25");
            const s2 = Subnet.fromCIDR("192.0.2.128/25");
            const s3 = Subnet.fromCIDR("198.51.100.0/24");
            const list = new SubnetList([s1, s2]);
            const initialSize = list.size();
            expect(list.add(s3)).toBe(true);
            expect(list.hasSubnet(s3)).toBe(true);
            expect(list.size()).toBe(initialSize + s3.size());
        });

        it("adds a subnet that expands an existing one and returns true", () => {
            const s1 = Subnet.fromCIDR("192.0.2.128/25");
            const s2 = Subnet.fromCIDR("192.0.2.0/24");
            const list = new SubnetList([s1]);
            expect(list.add(s2)).toBe(true);
            expect(list.hasSubnet(s2)).toBe(true);
            expect(list.size()).toBe(s2.size());
        });

        it("returns false when adding a duplicate subnet", () => {
            const s1 = Subnet.fromCIDR("192.0.2.0/25");
            const list = new SubnetList([s1]);
            expect(list.add(s1)).toBe(false);
        });

        it("returns false when adding a subnet that is already contained", () => {
            const s1 = Subnet.fromCIDR("192.0.2.0/24");
            const s2 = Subnet.fromCIDR("192.0.2.128/25");
            const list = new SubnetList([s1]);
            expect(list.add(s2)).toBe(false);
        });

        it("adds an IP address as a /32 subnet", () => {
            const ip = IPv4.fromString("192.0.2.5");
            const list = new SubnetList();
            expect(list.add(ip)).toBe(true);
            expect(list.subnets().map(s => s.toString())).toEqual(["192.0.2.5/32"]);
            expect(list.contains(ip)).toBe(true);
        });

        it("returns false when adding duplicate IP address", () => {
            const ip = IPv4.fromString("192.0.2.5");
            const list = new SubnetList([Subnet.fromCIDR("192.0.2.5/32")]);
            expect(list.add(ip)).toBe(false);
        });

        it("adds all subnets from another SubnetList", () => {
            const s1 = Subnet.fromCIDR("192.0.2.0/24");
            const s2 = Subnet.fromCIDR("198.51.100.0/24");
            const other = new SubnetList([s1, s2]);
            const list = new SubnetList();
            list.add(other);
            expect(list.hasSubnet(s1)).toBe(true);
            expect(list.hasSubnet(s2)).toBe(true);
            expect(list.size()).toBeLessThanOrEqual(s1.size() + s2.size());
        });
    });

    describe("remove", () => {
        it("removes existing subnet and returns true", () => {
            const s1 = Subnet.fromCIDR("192.0.2.0/25");
            const list = new SubnetList([s1]);
            expect(list.remove(s1)).toBe(true);
            expect(list.hasSubnet(s1)).toBe(false);
            expect(list.size()).toBe(0n);
        });

        it("removes subnet partially covered by a larger one", () => {
            const s1 = Subnet.fromCIDR("192.0.2.0/25");
            const s2 = Subnet.fromCIDR("192.0.2.128/25");
            const s3 = Subnet.fromCIDR("192.0.2.0/24");
            const list = new SubnetList([s3]);
            expect(list.remove(s2)).toBe(true);
            expect(list.hasSubnet(s1)).toBe(true);
            expect(list.hasSubnet(s2)).toBe(false);
            expect(list.size()).toBe(s1.size());
        });

        it("returns false when removing subnet not present", () => {
            const s1 = Subnet.fromCIDR("203.0.113.0/24");
            const list = new SubnetList();
            expect(list.remove(s1)).toBe(false);
        });
    });

    describe("hasSubnet", () => {
        it("returns true if subnet is in the list", () => {
            const s1 = Subnet.fromCIDR("192.0.2.0/25");
            const list = new SubnetList([s1]);
            expect(list.hasSubnet(s1)).toBe(true);
        });

        it("returns true if subnet is part of a larger one contained in the list", () => {
            const s1 = Subnet.fromCIDR("192.0.2.0/24");
            const s2 = Subnet.fromCIDR("192.0.2.128/25");
            const list = new SubnetList([s1]);
            expect(list.hasSubnet(s2)).toBe(true);
        });

        it("returns false if subnet is not in the list", () => {
            const s1 = Subnet.fromCIDR("192.0.2.0/25");
            const list = new SubnetList([Subnet.fromCIDR("198.51.100.0/24")]);
            expect(list.hasSubnet(s1)).toBe(false);
        });
    });

    describe("subnets", () => {
        it("returns all subnets", () => {
            const s1 = Subnet.fromCIDR("192.0.2.0/25");
            const s2 = Subnet.fromCIDR("192.0.2.128/25");
            const list = new SubnetList([s1, s2]);
            const all = list.subnets();
            for (const s of [s1, s2]) {
                const found = all.some(x => x.containsSubnet(s));
                expect(found).toBe(true);
            }
            const total = all.reduce((sum, s) => sum + s.size(), 0n);
            expect(total).toBe(s1.size() + s2.size());
        });
    });

    describe("contains", () => {
        it("returns true for IPs within any subnet", () => {
            const s1 = Subnet.fromCIDR("192.0.2.0/24");
            const s2 = Subnet.fromCIDR("198.51.100.0/24");
            const list = new SubnetList([s1, s2]);
            expect(list.contains(IPv4.fromString("192.0.2.78"))).toBe(true);
            expect(list.contains(IPv4.fromString("198.51.100.69"))).toBe(true);
        });

        it("returns false for IPs outside all subnets", () => {
            const ip = IPv4.fromString("198.51.100.1");
            const s = Subnet.fromCIDR("192.0.2.0/24");
            const list = new SubnetList([s]);
            expect(list.contains(ip)).toBe(false);
        });
    });

    describe("size", () => {
        it("returns sum of all subnet sizes", () => {
            const s1 = Subnet.fromCIDR("192.0.2.0/25");
            const s2 = Subnet.fromCIDR("192.0.2.128/25");
            const s3 = Subnet.fromCIDR("203.0.113.0/24");
            const list = new SubnetList([s1, s2, s3]);
            expect(list.size()).toBe(s1.size() + s2.size() + s3.size());
        });

        it("returns 0 when empty", () => {
            const list = new SubnetList();
            expect(list.size()).toBe(0n);
        });
    });

    describe("[Symbol.iterator]", () => {
        it("iterates over all IPs in all subnets", () => {
            const s1 = Subnet.fromCIDR("192.0.2.64/30");
            const s2 = Subnet.fromCIDR("192.0.2.24/30");
            const list = new SubnetList([s1, s2]);
            const ips = Array.from(list).map(ip => ip.toString());
            expect(ips).toEqual([
                "192.0.2.24",
                "192.0.2.25",
                "192.0.2.26",
                "192.0.2.27",
                "192.0.2.64",
                "192.0.2.65",
                "192.0.2.66",
                "192.0.2.67",
            ]);
        });

        it("iterates zero times when empty", () => {
            const list = new SubnetList();
            expect(Array.from(list)).toHaveLength(0);
        });
    });

    describe("static BOGON", () => {
        it("is a SubnetList instance", () => {
            expect(SubnetList.BOGON).toBeInstanceOf(SubnetList);
        });

        it("contains a common IPv4 bogon address", () => {
            const ip = IPv4.fromString("192.0.2.42");
            expect(SubnetList.BOGON.contains(ip)).toBe(true);
        });

        it("contains a common IPv6 bogon address", () => {
            const ip = IPv6.fromString("2001:db8::cafe:babe");
            expect(SubnetList.BOGON.contains(ip)).toBe(true);
        });

        it("does not contain a public IPv4 address", () => {
            const ip = IPv4.fromString("1.1.1.1");
            expect(SubnetList.BOGON.contains(ip)).toBe(false);
        });

        it("does not contain a public IPv6 address", () => {
            const ip = IPv6.fromString("2606:4700:4700::1111");
            expect(SubnetList.BOGON.contains(ip)).toBe(false);
        });
    });
});
