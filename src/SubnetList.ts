/*
 * Copyright © 2024–2025 Cloudnode OÜ
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
 * If not, see <https://www.gnu.org/licenses/>.
 */
import {IP, IPAddress, Network, Subnet} from "./index.js";

/**
 * Represents a network comprised of subnets.
 */
export class SubnetList implements Network {
    /**
     * A network of reserved subnets. This network does not contain publicly routable IP addresses.
     */
    public static readonly BOGON = new SubnetList([
        // IPv4
        Subnet.fromCIDR("0.0.0.0/8"),
        Subnet.fromCIDR("10.0.0.0/8"),
        Subnet.fromCIDR("100.64.0.0/10"),
        Subnet.fromCIDR("127.0.0.0/8"),
        Subnet.fromCIDR("169.254.0.0/16"),
        Subnet.fromCIDR("172.16.0.0/12"),
        Subnet.fromCIDR("192.0.0.0/24"),
        Subnet.fromCIDR("192.0.2.0/24"),
        Subnet.fromCIDR("192.88.99.0/24"),
        Subnet.fromCIDR("192.168.0.0/16"),
        Subnet.fromCIDR("198.18.0.0/15"),
        Subnet.fromCIDR("198.51.100.0/24"),
        Subnet.fromCIDR("203.0.113.0/24"),
        Subnet.fromCIDR("224.0.0.0/4"),
        Subnet.fromCIDR("233.252.0.0/24"),
        Subnet.fromCIDR("240.0.0.0/4"),
        Subnet.fromCIDR("255.255.255.255/32"),
        // IPv6
        Subnet.fromCIDR("::/128"),
        Subnet.fromCIDR("::1/128"),
        Subnet.fromCIDR("64:ff9b:1::/48"),
        Subnet.fromCIDR("100::/64"),
        Subnet.fromCIDR("2001:20::/28"),
        Subnet.fromCIDR("2001:db8::/32"),
        Subnet.fromCIDR("3fff::/20"),
        Subnet.fromCIDR("5f00::/16"),
        Subnet.fromCIDR("fc00::/7"),
        Subnet.fromCIDR("fe80::/10"),
    ]);

    readonly #subnets: Subnet<IP>[] = [];

    /**
     * Creates a new network.
     *
     * @param [subnets] Initial subnets to add to this network.
     */
    public constructor(subnets?: Iterable<Subnet<IP>>) {
        if (subnets)
            for (const subnet of subnets)
                this.add(subnet);
    }

    public* [Symbol.iterator](): Iterator<IP> {
        for (const subnet of this.#subnets.values())
            for (const address of subnet)
                yield address;
    }

    /**
     * Adds a subnet to this network.
     *
     * @param subnet Subnet to add.
     * @returns Whether the subnet was not already fully in the network.
     */
    public add(subnet: Subnet<IP>): boolean;

    /**
     * Adds an IP address to this network.
     *
     * @param ip IP address to add.
     * @returns Whether the IP address was not already in the network.
     */
    public add(ip: IP): boolean;

    /**
     * Adds a subnet list to this network.
     *
     * @param subnets Network of subnets to add.
     */
    public add(subnets: SubnetList): void;

    public add(a: Subnet<IP> | IP | SubnetList): boolean | void {
        if (a instanceof Subnet) {
            if (this.hasSubnet(a)) return false;

            const subSubnet = this.#subnets.findIndex(s => a.containsSubnet(s));
            if (subSubnet !== -1) {
                this.#subnets.splice(subSubnet, 1, a);
                this.optimise();
                return true;
            }

            this.#subnets.push(a);
            this.optimise();
            return true;
        }
        else if (a instanceof IPAddress) {
            const Class = a.constructor as IP.Class;
            return this.add(new Subnet(a, Class.BIT_LENGTH));
        }
        else {
            for (const subnet of a.#subnets)
                this.add(subnet);
            this.optimise();
            return;
        }
    }

    /**
     * Removes a subnet from this network.
     *
     * @param subnet Subnet to remove.
     * @returns Whether the subnet was found and removed.
     */
    public remove(subnet: Subnet<IP>) {
        for (const [index, s] of this.#subnets.entries()) {
            if (s.equals(subnet)) {
                this.#subnets.splice(index, 1);
                return true;
            }
            if (s.containsSubnet(subnet)) {
                this.#subnets.splice(index, 1, ...s.subtract(subnet));
                return true;
            }
        }
        return false;
    }

    /**
     * Checks if a subnet is in this network.
     *
     * @param subnet Subnet to check.
     */
    public hasSubnet(subnet: Subnet<IP>): boolean {
        return this.#subnets.some(s => s.containsSubnet(subnet));
    }

    /**
     * Returns all subnets in this network.
     */
    public subnets(): Subnet<IP>[] {
        return Array.from(this.#subnets);
    }

    /**
     * Checks if an IP address is in this network.
     *
     * @param address IP address to check.
     */
    public contains(address: IP): boolean {
        for (const subnet of this.#subnets.values()) if (subnet.contains(address)) return true;
        return false;
    }

    /**
     * Returns the number of addresses in this network.
     */
    public size(): bigint {
        let size = 0n;
        for (const subnet of this.#subnets.values()) size += subnet.size();
        return size;
    }

    /**
     * Optimises memory by merging adjacent subnets.
     */
    private optimise(): void {
        this.#subnets.sort((a, b) => a._AddressClass.BIT_LENGTH - b._AddressClass.BIT_LENGTH
            || b.prefix - a.prefix
            || (a.address.value < b.address.value ? -1 : 1),
        );

        let merged = false;

        for (let i = 0; i + 1 < this.#subnets.length;) {
            const left = this.#subnets.at(i)!;
            const right = this.#subnets.at(i + 1)!;

            if (!left.canMerge(right)) {
                ++i;
                continue;
            }

            merged = true;
            this.#subnets.splice(i, 2, left.merge(right));
        }

        if (merged) this.optimise();
    }
}
