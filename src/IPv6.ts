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
import {IPAddress, IPv4, Subnet} from "./index.js";

/**
 * Represents an Internet Protocol version 6 (IPv6) address.
 */
export class IPv6 extends IPAddress {
    /**
     * Bit length of IPv6 addresses.
     */
    public static BIT_LENGTH = 128;

    /**
     * Creates a new IPv6 address instance.
     *
     * @param value 128-bit unsigned integer.
     * @throws {@link !TypeError} If the value is not a 128-bit unsigned integer.
     */
    public constructor(value: bigint) {
        if (value < 0n || value > ((1n << BigInt(IPv6.BIT_LENGTH)) - 1n))
            throw new TypeError("Expected 128-bit unsigned integer, got " + value.constructor.name + " 0x" + value.toString(16));
        super(value);
    }

    /**
     * Creates an IPv6 address instance from hextets.
     *
     * @param hextets Typed array of 8 hextets.
     * @throws {@link !RangeError} If the number of hextets is not 8.
     */
    public static fromBinary(hextets: Uint16Array): IPv6 {
        if (hextets.length !== 8) throw new RangeError("Expected 8 hextets, got " + hextets.length);

        return new IPv6(
            BigInt(hextets[0]!) << 112n |
            BigInt(hextets[1]!) << 96n  |
            BigInt(hextets[2]!) << 80n  |
            BigInt(hextets[3]!) << 64n  |
            BigInt(hextets[4]!) << 48n  |
            BigInt(hextets[5]!) << 32n  |
            BigInt(hextets[6]!) << 16n  |
            BigInt(hextets[7]!)
        );
    }

    /**
     * Creates an IPv6 address instance from a string.
     *
     * @param ip String representation of an IPv6 address.
     * @throws {@link !RangeError} If the string is not a valid IPv6 address.
     */
    public static override fromString(ip: string): IPv6 {
        const parts = ip.split("::", 2);
        const hextestStart = parts[0]! === ""
            ? []
            : parts[0]!.split(":").flatMap(IPv6.parseHextet);
        const hextestEnd = parts[1] === undefined || parts[1] === ""
            ? []
            : parts[1].split(":").flatMap(IPv6.parseHextet);
        if (
            hextestStart.some(hextet => Number.isNaN(hextet) || hextet < 0 || hextet > 0xFFFF) ||
            hextestEnd.some(hextet => Number.isNaN(hextet) || hextet < 0 || hextet > 0xFFFF) ||
            (parts.length === 2 && hextestStart.length + hextestEnd.length > 6) ||
            (parts.length < 2 && hextestStart.length + hextestEnd.length !== 8)
        ) throw new RangeError("Expected valid IPv6 address, got " + ip);

        const hextets = new Uint16Array(8);
        hextets.set(hextestStart, 0);
        hextets.set(hextestEnd, 8 - hextestEnd.length);

        return IPv6.fromBinary(hextets);
    }

    /**
     * Parses a string hextet into unsigned 16-bit integer.
     *
     * @param hextet String representation of a hextet.
     * @internal
     */
    private static parseHextet(hextet: string): number | number[] {
        if (IPv4.REGEX.test(hextet)) {
            const ip = IPv4.fromString(hextet).binary();
            return [
                (ip[0]! << 8) | ip[1]!,
                (ip[2]! << 8) | ip[3]!
            ]
        }
        return Number.parseInt(hextet, 16);
    }

    /**
     * Returns the 8 hextets of the IPv6 address.
     */
    public binary(): Uint16Array {
        return new Uint16Array([
            (this.value >> 112n) & 0xFFFFn,
            (this.value >> 96n) & 0xFFFFn,
            (this.value >> 80n) & 0xFFFFn,
            (this.value >> 64n) & 0xFFFFn,
            (this.value >> 48n) & 0xFFFFn,
            (this.value >> 32n) & 0xFFFFn,
            (this.value >> 16n) & 0xFFFFn,
            this.value & 0xFFFFn
        ].map(Number));
    }

    /**
     * Checks whether this IPv6 address is an IPv4-mapped IPv6 address as defined by the `::ffff:0:0/96` prefix. This
     * method does not detect other IPv4 embedding or tunnelling formats.
     */
    public hasMappedIPv4(): boolean {
        return Subnet.IPV4_MAPPED_IPV6.contains(this);
    }

    /**
     * Returns the IPv4-mapped IPv6 address.
     *
     * @returns The IPv4 address from the least significant 32 bits of this IPv6 address.
     * @see {@link IPv6#hasMappedIPv4}
     */
    public getMappedIPv4(): IPv4 {
        const bin = this.binary().slice(-2);
        return IPv4.fromBinary(new Uint8Array([
            (bin[0]! >> 8) & 0xFF,
            bin[0]! & 0xFF,
            (bin[1]! >> 8) & 0xFF,
            bin[1]! & 0xFF
        ]));
    }

    /**
     * Returns the IP address as a string in colon-hexadecimal notation.
     */
    public override toString(): string {
        const str = Array.from(this.binary()).map(octet => octet.toString(16)).join(":");
        const longest = str.match(/(?:^|:)0(?::0)+(?:$|:)/g)
            ?.reduce((acc, cur) => cur.length > acc.length ? cur : acc, "") ?? null;
        if (longest === null) return str;
        return str.replace(longest, "::");
    }

    public override offset(offset: bigint | number): IPv6 {
        return new IPv6(this.value + BigInt(offset));
    }
}
