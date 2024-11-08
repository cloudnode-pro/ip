/*
 * Copyright © 2024 Cloudnode OÜ
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
 * An IPv4 address
 */
export class IPv4 extends IPAddress {
    public static regex = /^(?:(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]\d|\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]\d|\d)$/;
    public static bitLength = 32;

    /**
     * Create new IPv4 address instance
     * @throws {@link !TypeError} If
     */
    public constructor(value: bigint);

    public constructor(value: number);

    public constructor(value: number | bigint) {
        const int = BigInt(value);
        if (int < 0n || int > (1n << BigInt(IPv4.bitLength)) - 1n)
            throw new TypeError("Expected 32-bit unsigned integer, got " + int.constructor.name + " " + int.toString(10));
        super(int);
    }

    /**
     * Create an IPv4 address instance from octets
     * @throws {@link !RangeError} If provided octets are not 4
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
     * Create an IPv4 address instance from string
     * @throws {@link !RangeError} If provided string is not a valid IPv4 address
     */
    public static override fromString(str: string): IPv4 {
        const octets = str.split(".", 4).map(octet => Number.parseInt(octet, 10));
        if (octets.some(octet => Number.isNaN(octet) || octet < 0 || octet > 255))
            throw new RangeError("Expected valid IPv4 address, got " + str);

        return IPv4.fromBinary(new Uint8Array(octets));
    }

    /**
     * Get the 4 octets of the IPv4 address
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
