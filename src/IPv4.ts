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
import {IPAddress} from "./index.js";

/**
 * An IPv4 address.
 */
export class IPv4 extends IPAddress {
    /**
     * Regular expression for testing IPv4 addresses in string form.
     */
    public static regex = /^(?:(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]\d|\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]\d|\d)$/;

    /**
     * Bit length of IPv4 addresses.
     */
    public static bitLength = 32;

    /**
     * Creates a new IPv4 address instance.
     *
     * @param value A 32-bit unsigned big integer.
     * @throws {@link !TypeError} If provided value is not a 32-bit unsigned integer.
     */
    public constructor(value: bigint);

    /**
     * Creates a new IPv4 address instance.
     *
     * @param value A 32-bit unsigned number.
     * @throws {@link !TypeError} If provided value is not a 32-bit unsigned integer.
     */
    public constructor(value: number);

    public constructor(value: number | bigint) {
        const int = BigInt(value);
        if (int < 0n || int > (1n << BigInt(IPv4.bitLength)) - 1n)
            throw new TypeError("Expected 32-bit unsigned integer, got " + int.constructor.name + " " + int.toString(10));
        super(int);
    }

    /**
     * Creates an IPv4 address instance from octets.
     *
     * @param octets A typed array of 4 octets.
     * @throws {@link !RangeError} If provided octets are not 4.
     */
    public static fromBinary(octets: Uint8Array): IPv4 {
        if (octets.length !== 4) throw new RangeError("Expected 4 octets, got " + octets.length);

        return new IPv4(
            (
                octets[0]! << 24 |
                octets[1]! << 16 |
                octets[2]! << 8  |
                octets[3]!
            ) >>> 0
        );
    }

    /**
     * Creates an IPv4 address instance from a string.
     *
     * @param str A string representation of an IPv4 address.
     * @throws {@link !RangeError} If provided string is not a valid IPv4 address.
     */
    public static override fromString(str: string): IPv4 {
        const octets = str.split(".", 4).map(octet => Number.parseInt(octet, 10));
        if (octets.some(octet => Number.isNaN(octet) || octet < 0 || octet > 255))
            throw new RangeError("Expected valid IPv4 address, got " + str);

        return IPv4.fromBinary(new Uint8Array(octets));
    }

    /**
     * Gets the 4 octets of the IPv4 address.
     */
    public override binary(): Uint8Array {
        return new Uint8Array([
            (this.value >> 24n) & 0xFFn,
            (this.value >> 16n) & 0xFFn,
            (this.value >> 8n) & 0xFFn,
            this.value & 0xFFn,
        ].map(Number));
    }

    public override toString(): string {
        return Array.from(this.binary()).map(octet => octet.toString(10)).join(".");
    }
}
