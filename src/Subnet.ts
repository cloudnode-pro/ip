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
import {IPAddress, IPv4, IPv6} from "./index.js";

/**
 * A subnet of IP addresses.
 *
 * @typeParam T IP address family.
 */
export class Subnet<T extends IPv4 | IPv6> implements Iterable<T> {
    /**
     * IPv4-mapped IPv6 subnet.
     */
    public static readonly IPV4_MAPPED_IPV6 = Subnet.fromCIDR("::ffff:0.0.0.0/96");

    /**
     * The subnet address (i.e. the first/gateway IP address of the network).
     */
    public readonly address: T;

    /**
     * IP address constructor.
     */
    readonly #AddressClass: typeof IPv4 | typeof IPv6;

    /**
     * Creates a new subnet instance.
     *
     * @param address An IP address.
     * @param suffix Subnet suffix bits.
     * @throws {@link !RangeError} If the suffix is greater than the IP address family bit-length.
     */
    public constructor(address: T, public readonly suffix: number) {
        this.#AddressClass = address.constructor as typeof IPv4 | typeof IPv6;
        if (suffix > this.#AddressClass.bitLength) throw new RangeError("Expected suffix less than " + this.#AddressClass.bitLength + ", got " + suffix);
        this.address = new this.#AddressClass(address.value & this.netmask()) as T;
    }

    /**
     * Creates a subnet from a string in CIDR notation.
     *
     * @param cidr A string in CIDR notation.
     * @throws {@link !RangeError} If the address or suffix is invalid
     */
    public static fromCIDR(cidr: string): Subnet<IPv4 | IPv6> {
        const parts = cidr.split("/", 2);
        if (parts.length !== 2) throw new RangeError("Expected CIDR notation, got " + cidr);
        const suffix = Number.parseInt(parts[1]!, 10);
        return new Subnet<IPv4 | IPv6>(IPAddress.fromString(parts[0]!), suffix);
    }

    /**
     * Gets the network mask.
     */
    public netmask(): bigint {
        return ((1n << BigInt(this.suffix)) - 1n) << BigInt(this.#AddressClass.bitLength - this.suffix);
    }

    /**
     * Gets the network wildcard mask.
     */
    public wildcard(): bigint {
        return ((1n << BigInt(this.#AddressClass.bitLength - this.suffix)) - 1n);
    }

    /**
     * Gets the last IP address in the subnet (i.e. broadcast address).
     */
    public broadcast(): T {
        return new this.#AddressClass(this.address.value | this.wildcard()) as T;
    }

    /**
     * Checks if the provided IP address is in this subnet.
     *
     * @param address IP address to check.
     */
    public has(address: T): boolean {
        if (!(address instanceof this.#AddressClass)) return false;
        return (address.value & this.netmask()) === this.address.value;
    }

    /**
     * Gets the number of addresses in this subnet. This number includes the broadcast and gateway addresses, so for the
     * number of *usable* addresses, subtract 2.
     */
    public size(): bigint {
        return this.wildcard() + 1n;
    }

    /**
     * Iterates all IP addresses in this subnet.
     *
     * **NOTE**: This can be slow for large subnets. If you need to check if an
     * IP address is in the subnet, use {@link Subnet#has}.
     */
    public* iterate(): IterableIterator<T> {
        for (let i = this.address.value; i <= this.broadcast().value; ++i) yield new this.#AddressClass(i) as T;
    }

    /**
     * Iterates all IP addresses in this subnet.
     *
     * **NOTE**: This can be slow for large subnets. If you need to check if an
     * IP address is in the subnet, use {@link Subnet#has}.
     */
    public [Symbol.iterator](): IterableIterator<T> {
        return this.iterate();
    }

    /**
     * Creates a set containing all IP addresses in this subnet.
     *
     * **NOTE**: This can be slow for large subnets. If you need to check if an
     * IP address is in the subnet, use {@link Subnet#has}.
     */
    public set(): Set<T> {
        return new Set(this.iterate());
    }

    /**
     * Creates a string representation of this subnet in CIDR notation.
     *
     * @example "203.0.113.0/24"
     */
    public toString(): string {
        return this.address.toString() + "/" + this.suffix;
    }
}
