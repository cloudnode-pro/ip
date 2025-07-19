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
import {IP, IPv4, IPv6} from "./index.js";

/**
 * Represents an Internet Protocol (IP) address.
 *
 * @sealed
 */
export abstract class IPAddress {
    /**
     * Integer representation of the IP address.
     */
    public readonly value: bigint;

    /**
     * Creates a new IP address instance.
     *
     * @param value Integer representation of the IP address.
     * @internal
     */
    protected constructor(value: bigint) {
        this.value = value;
    }

    /**
     * Creates an IP address from a string.
     *
     * @param ip String representation of the IP address.
     * @param [resolveMapped=false] Whether to resolve IPv4-mapped IPv6 addresses (see {@link IPv6.hasMappedIPv4}).
     * @throws {@link !RangeError} If the string is not a valid IPv4 or IPv6 address.
     */
    public static fromString(ip: string, resolveMapped = false): IP {
        if (ip.includes(":")) {
            const ipv6 = IPv6.fromString(ip);
            if (resolveMapped && ipv6.hasMappedIPv4())
                return ipv6.getMappedIPv4();
            return ipv6;
        }
        return IPv4.fromString(ip);
    }

    /**
     * Returns the binary representation of the IP address.
     */
    public abstract binary(): ArrayBufferView;

    /**
     * Checks if the given address is equal to this address.
     *
     * @param other Address to compare.
     */
    public equals(other: IPAddress): boolean {
        return other instanceof this.constructor && other.value === this.value;
    }

    /**
     * Returns the IP address as a bigint or string primitive.
     *
     * @param hint Preferred primitive type.
     */
    public [Symbol.toPrimitive](hint: "number" | "string" | "default"): bigint | string {
        if (hint === "string")
            return this.toString();
        return this.value;
    }

    /**
     * Returns the IP address as a string.
     */
    public abstract toString(): string;

    /**
     * Returns a new IP address offset by the given amount from this address.
     *
     * @example ip.offset(1) // Returns the next IP address.
     * @example ip.offset(-1) // Returns the previous IP address.
     * @example IPAddress.fromString("203.0.113.42").offset(-18) // Returns 203.0.113.24.
     *
     * @param offset Number of steps to offset, positive or negative.
     * @throws {@link !TypeError} If the resulting address is outside the IP address family range.
     */
    public abstract offset(offset: number | bigint): IPAddress;
}
