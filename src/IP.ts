/*
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
import {IPv4} from "./IPv4.js";
import {IPv6} from "./IPv6.js";

/**
 * An {@link IPv4} or {@link IPv6} address.
 */
export type IP = IPv4 | IPv6;

export namespace IP {
    /**
     * An {@link IPv4} or {@link IPv6} address class.
     */
    export type Class = typeof IPv4 | typeof IPv6;
}
