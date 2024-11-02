/*
 * Copyright © 2024 Cloudnode OÜ.
 *
 * This file is part of @cldn/ip.
 *
 * @cldn/ip is free software: you can redistribute it and/or modify it under the terms of the GNU Lesser
 * General Public License as published by the Free Software Foundation, either version 3 of the License,
 * or (at your option) any later version.
 *
 * @cldn/ip is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the
 * implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License
 * for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License along with @cldn/ip.
 * If not, see <https://www.gnu.org/licenses/>
 */
import {expect} from "chai";
import {IPv4, IPv6, Network, Subnet} from "../dist/index.js";

describe("Network", () => {
    let network;

    beforeEach(() => {
        network = new Network();
    });

    describe("Constructor", () => {
        it("should create a network without subnets", () => {
            expect(network.subnets().size).to.equal(0);
        });

        it("should create a network with initial subnets", () => {
            const subnet1 = Subnet.fromCIDR("203.0.113.0/24");
            const subnet2 = Subnet.fromCIDR("169.254.0.0/16");
            const newNetwork = new Network([subnet1, subnet2]);
            expect(newNetwork.subnets().size).to.equal(2);
            expect(newNetwork.hasSubnet("203.0.113.0/24")).to.be.true;
            expect(newNetwork.hasSubnet("169.254.0.0/16")).to.be.true;
        });
    });

    describe("Add Subnet", () => {
        it("should add a subnet to the network", () => {
            const subnet = Subnet.fromCIDR("169.254.0.0/16");
            network.add(subnet);
            expect(network.hasSubnet("169.254.0.0/16")).to.be.true;
        });

        it("should not add duplicate subnets", () => {
            const subnet = Subnet.fromCIDR("169.254.0.0/16");
            network.add(subnet);
            network.add(subnet);
            expect(network.subnets().size).to.equal(1);
        });
    });

    describe("Remove Subnet", () => {
        it("should remove a subnet from the network", () => {
            const subnet = Subnet.fromCIDR("169.254.0.0/16");
            network.add(subnet);
            expect(network.hasSubnet("169.254.0.0/16")).to.be.true;
            network.remove("169.254.0.0/16");
            expect(network.hasSubnet("169.254.0.0/16")).to.be.false;
        });

        it("should not throw error when removing non-existing subnet", () => {
            expect(() => network.remove("169.254.0.0/16")).to.not.throw();
        });
    });

    describe("Check Subnet Presence", () => {
        it("should return true if the subnet exists", () => {
            const subnet = Subnet.fromCIDR("169.254.0.0/16");
            network.add(subnet);
            expect(network.hasSubnet("169.254.0.0/16")).to.be.true;
        });

        it("should return false if the subnet does not exist", () => {
            expect(network.hasSubnet("169.254.0.0/16")).to.be.false;
        });
    });

    describe("Check IP Address Presence", () => {
        let subnet;

        beforeEach(() => {
            subnet = Subnet.fromCIDR("169.254.0.0/16");
            network.add(subnet);
        });

        it("should return true if an IP address is in the network", () => {
            const ipInSubnet = IPv4.fromString("169.254.68.42");
            expect(network.has(ipInSubnet)).to.be.true;
        });

        it("should return false if an IP address is not in the network", () => {
            const ipOutsideSubnet = IPv4.fromString("192.0.2.42");
            expect(network.has(ipOutsideSubnet)).to.be.false;
        });
    });

    describe("Get Size of Network", () => {
        it("should return the total number of addresses in the network", () => {
            const subnet1 = Subnet.fromCIDR("203.0.113.0/24");
            const subnet2 = Subnet.fromCIDR("169.254.0.0/16");
            network.add(subnet1);
            network.add(subnet2);
            expect(network.size()).to.equal(2n ** 8n + 2n ** 16n);
        });
    });
});
