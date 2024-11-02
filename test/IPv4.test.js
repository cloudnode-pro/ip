/*
 * Copyright © 2024 Cloudnode OÜ.
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
import { expect } from "chai";
import {IPv4} from "../dist/index.js";

describe("IPv4", () => {

    describe("Constructor", () => {
        it("should create an IPv4 address from a valid number", () => {
            const ip = new IPv4(2130706433);
            expect(ip.toString()).to.equal("127.0.0.1");
        });

        it("should create an IPv4 address from a valid bigint", () => {
            const ip = new IPv4(2130706433n);
            expect(ip.toString()).to.equal("127.0.0.1");
        });

        it("should throw TypeError for negative number", () => {
            expect(() => new IPv4(-1)).to.throw(TypeError, /Expected 32-bit unsigned integer/);
        });

        it("should throw TypeError for number larger than 32 bits", () => {
            expect(() => new IPv4(4294967296)).to.throw(TypeError, /Expected 32-bit unsigned integer/);
        });
    });

    describe("Static Methods", () => {
        describe("fromBinary", () => {
            it("should create an IPv4 address from valid octets", () => {
                const ip = IPv4.fromBinary(new Uint8Array([127, 0, 0, 1]));
                expect(ip.toString()).to.equal("127.0.0.1");
            });

            it("should throw RangeError if octets length is not 4", () => {
                expect(() => IPv4.fromBinary(new Uint8Array([127, 0, 0]))).to.throw(RangeError, /Expected 4 octets/);
                expect(() => IPv4.fromBinary(new Uint8Array([127, 0, 0, 1, 1]))).to.throw(RangeError, /Expected 4 octets/);
            });
        });

        describe("fromString", () => {
            it("should create an IPv4 address from a valid string", () => {
                const ip = IPv4.fromString("127.0.0.1");
                expect(ip.toString()).to.equal("127.0.0.1");
            });

            it("should throw RangeError for invalid IPv4 string", () => {
                expect(() => IPv4.fromString("256.0.0.1")).to.throw(RangeError, /Expected valid IPv4 address/);
                expect(() => IPv4.fromString("127.0.0")).to.throw(RangeError, /Expected 4 octets/);
                expect(() => IPv4.fromString("invalid.ip")).to.throw(RangeError, /Expected valid IPv4 address/);
            });
        });
    });

    describe("Instance Methods", () => {
        let ip;

        beforeEach(() => {
            ip = new IPv4(2130706433);
        });

        it("should return binary representation of the IPv4 address", () => {
            const binary = ip.binary();
            expect(binary).to.deep.equal(new Uint8Array([127, 0, 0, 1]));
        });

        it("should return string representation of the IPv4 address", () => {
            expect(ip.toString()).to.equal("127.0.0.1");
        });
    });
});
