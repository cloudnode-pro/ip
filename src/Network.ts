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
import {IPv4, IPv6, Subnet} from "./index.js"

/**
 * A network that can contain multiple subnets.
 */
export class Network {
    /**
     * A network of reserved subnets. This network does not contain publicly routable IP addresses.
     */
    public static readonly BOGON = new Network([
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

    readonly #subnets: Map<string, Subnet<IPv4 | IPv6>> = new Map();

    /**
     * Creates a new network.
     *
     * @param [subnets] Initial subnets to add to this network.
     */
    public constructor(subnets?: Iterable<Subnet<IPv4 | IPv6>>) {
        if (subnets) for (const subnet of subnets) this.add(subnet);
    }

    /**
     * Adds a subnet to this network.
     */
    public add(subnet: Subnet<IPv4 | IPv6>): void {
        this.#subnets.set(subnet.toString(), subnet);
    }

    /**
     * Removes a subnet from this network.
     *
     * @param cidr CIDR notation of the subnet to remove.
     */
    public remove(cidr: string): void {
        this.#subnets.delete(Subnet.fromCIDR(cidr).toString());
    }

    /**
     * Checks if a subnet is in this network.
     *
     * @param cidr CIDR notation of the subnet to check.
     */
    public hasSubnet(cidr: string): boolean {
        return this.#subnets.has(Subnet.fromCIDR(cidr).toString());
    }

    /**
     * Gets all subnets in this network mapped to their CIDR notation.
     */
    public subnets(): ReadonlyMap<string, Subnet<IPv4 | IPv6>> {
        return this.#subnets;
    }

    /**
     * Checks if an IP address is in this network.
     *
     * @param address IP address to check.
     */
    public has(address: IPv4 | IPv6): boolean {
        for (const subnet of this.#subnets.values()) if (subnet.has(address)) return true;
        return false;
    }

    /**
     * Gets the number of addresses in this network.
     */
    public size(): bigint {
        let size = 0n;
        for (const subnet of this.#subnets.values()) size += subnet.size();
        return size;
    }
}
