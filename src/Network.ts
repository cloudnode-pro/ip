/*!
 * Copyright © 2025 Cloudnode OÜ.
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
import {IP} from "./IP.js";

/**
 * A network of IP addresses.
 */
export interface Network<T extends IP = IP> extends Iterable<T> {
    /**
     * Determines whether this network contains the provided IP address.
     *
     * @param address IP address to check.
     */
    contains(address: T): boolean;

    /**
     * Returns the exact number of IP addresses in this network.
     */
    size(): bigint;

    /**
     * Iterates over all IP addresses in this network.
     */
    [Symbol.iterator](): Iterator<T>;
}
