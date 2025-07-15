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
import {IPv4, IPv6} from "./index.js";

/**
 * An IP address.
 */
export abstract class IPAddress {
    /**
     * The integer representation of the IP address.
     */
    public readonly value: bigint;

    /**
     * Creates a new IP address instance.
     *
     * @param value The integer representation of the IP address.
     * @deprecated This class will be sealed in v2.0.0 and should not be extended by public API users.
     */
    protected constructor(value: bigint) {
        this.value = value;
    }

    /**
     * Creates an IP address from a string.
     *
     * @throws {@link !RangeError} If provided string is not a valid IPv4 or IPv6 address
     */
    public static fromString(str: string): IPv4 | IPv6 {
        if (str.includes(":")) return IPv6.fromString(str);
        return IPv4.fromString(str);
    }

    /**
     * Gets the IP address binary representation.
     */
    public abstract binary(): ArrayBufferView;

    /**
     * Checks if the given addresses are equal.
     */
    public equals(other: IPAddress): boolean {
        return other instanceof this.constructor && other.value === this.value;
    }

    /**
     * Formats the IP address as string.
     */
    public abstract toString(): string;
}
