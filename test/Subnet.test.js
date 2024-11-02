import {expect} from "chai";
import {IPv4, IPv6, Subnet} from "../dist/index.js";

describe("Subnet", () => {
    describe("Constructor", () => {
        it("should create a subnet with a valid IPv4 address and suffix", () => {
            const subnet = new Subnet(new IPv4(3925606468), 24);
            expect(subnet.address.toString()).to.equal("233.252.0.0");
            expect(subnet.suffix).to.equal(24);
        });

        it("should create a subnet with a valid IPv6 address and suffix", () => {
            const subnet = new Subnet(new IPv6(0xFDCA_B50F_8DF4_C52C_1337_C0FF_EB4D_C0DEn), 64);
            expect(subnet.address.toString()).to.equal("fdca:b50f:8df4:c52c::");
            expect(subnet.suffix).to.equal(64);
        });

        it("should throw RangeError if suffix is greater than the IP address family bit-length", () => {
            expect(() => new Subnet(new IPv4(3925606468), 33)).to.throw(RangeError, /Expected suffix less than 32/);
            expect(() => new Subnet(new IPv6(0xFDCA_B50F_8DF4_C52C_1337_C0FF_EB4D_C0DEn), 129)).to.throw(RangeError, /Expected suffix less than 128/);
        });
    });

    describe("Static Methods", () => {
        describe("fromCIDR", () => {
            it("should create a subnet from valid CIDR notation for IPv4", () => {
                const subnet = Subnet.fromCIDR("233.252.0.68/24");
                expect(subnet.address.toString()).to.equal("233.252.0.0");
                expect(subnet.suffix).to.equal(24);
            });

            it("should create a subnet from valid CIDR notation for IPv6", () => {
                const subnet = Subnet.fromCIDR("fdca:b50f::1337/32");
                expect(subnet.address.toString()).to.equal("fdca:b50f::");
                expect(subnet.suffix).to.equal(32);
            });

            it("should throw RangeError for invalid CIDR notation", () => {
                expect(() => Subnet.fromCIDR("invalidCIDR")).to.throw(RangeError, /Expected CIDR notation/);
                expect(() => Subnet.fromCIDR("233.252.0.68")).to.throw(RangeError, /Expected CIDR notation/);
            });
        });
    });

    describe("Instance Methods", () => {
        let subnet4;
        let subnet6;

        beforeEach(() => {
            subnet4 = new Subnet(new IPv4(3925606468), 24);
            subnet6 = new Subnet(new IPv6(0xFDCA_B50F_8DF4_C52C_1337_C0FF_EB4D_C0DEn), 64);
        });

        it("should calculate netmask for IPv4 subnet", () => {
            expect(subnet4.netmask()).to.equal(0xFFFFFF00n);
        });

        it("should calculate wildcard for IPv4 subnet", () => {
            expect(subnet4.wildcard()).to.equal(255n);
        });

        it("should calculate broadcast address for IPv4 subnet", () => {
            expect(subnet4.broadcast().toString()).to.equal("233.252.0.255");
        });

        it("should check if an IP address is in the subnet for IPv4", () => {
            const addressInSubnet = new IPv4(3925606468);
            const addressOutOfSubnet = new IPv4(3405803844);
            expect(subnet4.has(addressInSubnet)).to.be.true;
            expect(subnet4.has(addressOutOfSubnet)).to.be.false;
        });

        it("should calculate size of the IPv4 subnet", () => {
            expect(subnet4.size()).to.equal(256n);
        });

        it("should iterate over all IP addresses in the IPv4 subnet", () => {
            const addresses = Array.from(subnet4.iterate()).map(ip => ip.toString());
            expect(addresses).to.deep.equal(Array.from({length: 256}, (_, i) => `233.252.0.${i}`));
        });

        it("should calculate netmask for IPv6 subnet", () => {
            expect(subnet6.netmask()).to.equal(0xFFFFFFFFFFFFFFFF0000000000000000n);
        });

        it("should calculate wildcard for IPv6 subnet", () => {
            expect(subnet6.wildcard()).to.equal(0xFFFFFFFFFFFFFFFFn);
        });

        it("should calculate broadcast address for IPv6 subnet", () => {
            expect(subnet6.broadcast().toString()).to.equal("fdca:b50f:8df4:c52c:ffff:ffff:ffff:ffff");
        });

        it("should check if an IP address is in the subnet for IPv6", () => {
            const addressInSubnet = IPv6.fromString("fdca:b50f:8df4:c52c:1337:c0ff:eb4d:c0de");
            const addressOutOfSubnet = IPv6.fromString("fdca:b510::1");
            expect(subnet6.has(addressInSubnet)).to.be.true;
            expect(subnet6.has(addressOutOfSubnet)).to.be.false;
        });

        it("should calculate size of the IPv6 subnet", () => {
            expect(subnet6.size()).to.equal(2n ** 64n);
        });
    });

    describe("Iteration", () => {
        it("should implement iterable interface", () => {
            const subnet = new Subnet(new IPv4(3925606468), 30);
            const addresses = [...subnet];
            expect(addresses.map(ip => ip.toString())).to.deep.equal(["233.252.0.68", "233.252.0.69", "233.252.0.70", "233.252.0.71"]);
        });
    });

    describe("String Representation", () => {
        it("should return CIDR representation for IPv4", () => {
            const subnet = new Subnet(new IPv4(3925606468), 24);
            expect(subnet.toString()).to.equal("233.252.0.0/24");
        });

        it("should return CIDR representation for IPv6", () => {
            const subnet = new Subnet(new IPv6(0xFDCA_B50F_8DF4_C52C_1337_C0FF_EB4D_C0DEn), 64);
            expect(subnet.toString()).to.equal("fdca:b50f:8df4:c52c::/64");
        });
    });
});
