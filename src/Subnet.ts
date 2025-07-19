/*
 * Copyright © 2024–2025 Cloudnode OÜ.
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
import {IP, IPAddress, Network} from "./index.js";

/**
 * Represents an address range subnetwork of Internet Protocol (IP) addresses.
 *
 * @typeParam T IP address family.
 */
export class Subnet<T extends IP> implements Network<T> {
    /**
     * Subnet for IPv4-mapped IPv6 addresses (`::ffff:0.0.0.0/96`).
     */
    public static readonly IPV4_MAPPED_IPV6 = Subnet.fromCIDR("::ffff:0.0.0.0/96");

    /**
     * Subnet address (i.e. the first IP address of the network).
     */
    public readonly address: T;

    /**
     * Bit length of the subnet prefix.
     */
    public readonly prefix: number;

    /**
     * IP address constructor.
     *
     * @internal
     */
    public readonly _AddressClass: IP.Class;

    /**
     * Creates a new subnet instance.
     *
     * @param address IP address.
     * @param prefix Bit length of the subnet prefix.
     * @throws {@link !RangeError} If the prefix is greater than the IP address family bit length, or if negative.
     */
    public constructor(address: T, prefix: number) {
        this._AddressClass = address.constructor as IP.Class;
        if (prefix < 0)
            throw new RangeError("Expected positive prefix, got " + prefix);
        if (prefix > this._AddressClass.BIT_LENGTH)
            throw new RangeError(`Expected prefix less than ${this._AddressClass.BIT_LENGTH}, got ${prefix}`);
        this.prefix = prefix;
        this.address = new this._AddressClass(address.value & this.netmask()) as T;
    }

    /**
     * Creates a subnet from a string in CIDR notation.
     *
     * @param cidr String in CIDR notation.
     * @throws {@link !RangeError} If the address or prefix is invalid.
     */
    public static fromCIDR<T extends IP = IP>(cidr: string): Subnet<T> {
        const parts = cidr.split("/", 2);
        if (parts.length !== 2) throw new RangeError("Expected CIDR notation, got " + cidr);
        const prefix = Number.parseInt(parts[1]!, 10);
        if (Number.isNaN(prefix)) throw new RangeError("Expected numeric prefix, got " + parts[1]);
        return new Subnet<T>(IPAddress.fromString(parts[0]!) as T, prefix);
    }

    /**
     * Creates an array of subnets to represent an arbitrary range of IP addresses.
     *
     * @param start Starting IP address.
     * @param end Ending IP address.
     */
    public static range<T extends IP>(start: T, end: T): Subnet<T>[] {
        const AddressClass = start.constructor as IP.Class;
        const result: Subnet<T>[] = [];

        let current = start.value;

        while (current <= end.value) {
            let tz = 0;
            while (tz < AddressClass.BIT_LENGTH && ((current >> BigInt(tz)) & 1n) === 0n)
                ++tz;
            const prefixAlign = AddressClass.BIT_LENGTH - tz;

            let remaining = end.value - current + 1n;
            let maxBlockBits = 0;
            while (remaining > 1n) {
                remaining >>= 1n;
                ++maxBlockBits;
            }
            const prefixRange = AddressClass.BIT_LENGTH - maxBlockBits;

            const subnet = new Subnet(new AddressClass(current) as T, Math.max(prefixAlign, prefixRange));
            result.push(subnet);
            current += subnet.size();
        }

        return result;
    }

    /**
     * Returns the network mask of this subnet.
     */
    public netmask(): bigint {
        return ((1n << BigInt(this.prefix)) - 1n) << BigInt(this._AddressClass.BIT_LENGTH - this.prefix);
    }

    /**
     * Returns the wildcard (host) mask—the inverse of the {@link netmask}.
     */
    public wildcard(): bigint {
        return (1n << BigInt(this._AddressClass.BIT_LENGTH - this.prefix)) - 1n;
    }

    /**
     * Returns the address at the specific index.
     *
     * @param index Zero-based index of the address to be returned. Negative index counts from the end of the subnet.
     * @returns The address in the subnet matching the given index. Always returns `undefined` if `index < -size()` or
     *     `index >= size()`.
     */
    public at(index: 0 | 0n | -1 | -1n): T;

    /**
     * Returns the address at the specific index.
     *
     * @param index Zero-based index of the address to be returned. Negative index counts from the end of the subnet.
     * @returns The address in the subnet matching the given index. Always returns `undefined` if `index < -size()` or
     *     `index >= size()`.
     */
    public at(index: bigint): T | undefined;

    /**
     * Returns the address at the specific index.
     *
     * @param index Zero-based index of the address to be returned. Negative index counts from the end of the subnet.
     * @returns The address in the subnet matching the given index. Always returns `undefined` if `index < -size()` or
     *     `index >= size()`.
     */
    public at(index: number): T | undefined;

    public at(a: bigint | number): T | undefined {
        const index = BigInt(a);
        if (index < -this.size() || index >= this.size()) return undefined;
        if (index < 0)
            return this.at(this.size() + index);
        return new this._AddressClass(this.address.value + BigInt(index)) as T;
    }

    /**
     * Determines whether the provided address is contained within this subnet.
     *
     * @param address IP address to check.
     */
    public contains(address: T): boolean {
        return address instanceof this._AddressClass && (address.value & this.netmask()) === this.address.value;
    }

    /**
     * Determines whether the provided subnet is fully contained within this subnet.
     *
     * @param subnet Subnet to check.
     */
    public containsSubnet(subnet: Subnet<T>): boolean {
        return this.prefix <= subnet.prefix && this.contains(subnet.address);
    }

    /**
     * Returns the exact number of addresses in this subnet.
     */
    public size(): bigint {
        return this.wildcard() + 1n;
    }

    /**
     * Iterates all IP addresses in this subnet.
     *
     * **NOTE**: This can be slow for large subnets.
     */
    public* addresses(): IterableIterator<T> {
        const end = this.address.value + this.size();
        for (let i = this.address.value; i < end; ++i)
            yield new this._AddressClass(i) as T;
    }

    /**
     * Iterates all IP addresses in this subnet.
     *
     * **NOTE**: This can be slow for large subnets.
     */
    public [Symbol.iterator](): Iterator<T> {
        return this.addresses();
    }

    /**
     * Creates a set containing all IP addresses in this subnet.
     *
     * **NOTE**: This can be slow for large subnets.
     */
    public set(): Set<T> {
        return new Set(this.addresses());
    }

    /**
     * Returns the string representation of this subnet in CIDR notation.
     *
     * @example "203.0.113.0/24"
     */
    public toString(): string {
        return this.address.toString() + "/" + this.prefix;
    }

    /**
     * Checks if this subnet is adjacent to another subnet.
     *
     * @param subnet Subnet to check.
     * @throws {@link !TypeError} If the provided subnet is not of the same family.
     */
    public isAdjacent(subnet: Subnet<T>): boolean {
        if (this._AddressClass !== subnet._AddressClass)
            throw new TypeError(`Expected ${this._AddressClass.name} subnet, but got ${subnet._AddressClass.name}.`);

        return (this.address.value + this.size() === subnet.address.value)
            || (subnet.address.value + subnet.size() === this.address.value);
    }

    /**
     * Checks whether another subnet can be merged with this subnet.
     *
     * @param subnet Subnet to check.
     */
    public canMerge(subnet: Subnet<T>): boolean {
        if (this.prefix !== subnet.prefix)
            return false;
        try {
            return this.isAdjacent(subnet);
        }
        catch {
            return false;
        }
    }

    /**
     * Creates a larger subnet by merging with an adjacent subnet of the same family and size.
     *
     * @param subnet Subnet to merge with.
     * @throws {@link !TypeError} If the subnet is not of the same family or size.
     * @throws {@link !RangeError} If the subnet is not adjacent to this subnet.
     */
    public merge(subnet: Subnet<T>): Subnet<T> {
        if (!this.isAdjacent(subnet))
            throw new RangeError(`${subnet.toString()} is not adjacent to ${this.toString()}.`);
        if (this.prefix !== subnet.prefix)
            throw new TypeError(`Expected /${this.prefix} subnet, but got /${subnet.prefix}.`);

        return new Subnet<T>(
            this.address.value < subnet.address.value
            ? this.address
            : subnet.address,
            this.prefix - 1,
        );
    }

    /**
     * Splits this subnet into as many subnets of the specified prefix length as possible.
     *
     * @param prefix Prefix length of the resulting subnets.
     * @throws {@link !RangeError} If the prefix is smaller than the current prefix, or over the IP address
     *     family bit length.
     */
    public split(prefix: number): Subnet<T>[] {
        if (prefix < this.prefix || prefix > this._AddressClass.BIT_LENGTH)
            throw new RangeError(
                `Expected prefix in the range [${this.prefix + 1}, ${this._AddressClass.BIT_LENGTH}], got ${prefix}.`,
            );

        const length = 1 << (prefix - this.prefix);
        const size = this.size() / BigInt(length);

        return Array.from({length}, (_, i) => new Subnet<T>(
            new this._AddressClass(this.address.value + BigInt(i) * size) as T,
            prefix,
        ));
    }

    /**
     * Subtracts a subnet from this subnet.
     *
     * @param subnet Subnet to exclude.
     * @throws {@link !TypeError} If the subnet is not of the same family.
     * @returns An array of subnets representing the portions of this subnet that do not overlap with the given subnet.
     *     Returns an empty array if the given subnet fully covers this subnet.
     */
    public subtract(subnet: Subnet<T>): Subnet<T>[] {
        if (this._AddressClass !== subnet._AddressClass)
            throw new TypeError(`Expected ${this._AddressClass.name} subnet, but got ${subnet._AddressClass.name}.`);

        if (subnet.containsSubnet(this))
            return [];

        if (!this.containsSubnet(subnet))
            return [this];

        const result: Subnet<T>[] = [];

        if (this.address.value < subnet.address.value)
            result.push(...Subnet.range(this.address, subnet.address.offset(-1) as T));

        if (subnet.at(-1).value < this.at(-1).value)
            result.push(...Subnet.range(subnet.at(-1).offset(1) as T, this.at(-1)));

        return result;
    }

    /**
     * Checks if the given subnets are equal.
     *
     * @param subnet Subnet to compare.
     */
    public equals(subnet: Subnet<IP>): boolean {
        return this._AddressClass === subnet._AddressClass
            && this.address.equals(subnet.address)
            && this.prefix === subnet.prefix;
    }
}
