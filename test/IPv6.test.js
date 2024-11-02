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
import {expect} from "chai";
import {IPv6} from "../dist/index.js";

describe("IPv6", () => {

    describe("Constructor", () => {
        it("should create an IPv6 address from a valid bigint", () => {
            const ip = new IPv6(0x2001_0db8_0000_0000_0000_0000_0000_0001n);
            expect(ip.toString()).to.equal("2001:db8::1");
        });

        it("should throw TypeError for negative bigint", () => {
            expect(() => new IPv6(-1n)).to.throw(TypeError, /Expected 128-bit unsigned integer/);
        });

        it("should throw TypeError for bigint larger than 128 bits", () => {
            const bigInt = 1n << 128n;
            expect(() => new IPv6(bigInt)).to.throw(TypeError, /Expected 128-bit unsigned integer/);
        });
    });

    describe("Static Methods", () => {
        describe("fromBinary", () => {
            it("should create an IPv6 address from valid hextets", () => {
                const ip = IPv6.fromBinary(new Uint16Array([0x3fff, 0x636c, 0x6f75, 0x646e, 0x6f64, 0x65, 0x0, 0x0]));
                expect(ip.toString()).to.equal("3fff:636c:6f75:646e:6f64:65::");
            });

            it("should throw RangeError if hextets length is not 8", () => {
                expect(() => IPv6.fromBinary(new Uint16Array([0, 0, 0, 0, 0, 0, 0]))).to.throw(RangeError, /Expected 8 hextets/);
                expect(() => IPv6.fromBinary(new Uint16Array([0, 0, 0, 0, 0, 0, 0, 0, 0]))).to.throw(RangeError, /Expected 8 hextets/);
            });
        });

        describe("fromString", () => {
            it("should create an IPv6 address from a valid string", () => {
                const ip = IPv6.fromString("2001:0db8:85a3:0000:0000:8a2e:0370:7334");
                expect(ip.toString()).to.equal("2001:db8:85a3::8a2e:370:7334");
            });

            it("should create an IPv6 address from a compressed format", () => {
                const ip = IPv6.fromString("2001:db8::ff00:42:8329");
                expect(ip.toString()).to.equal("2001:db8::ff00:42:8329");
            });

            it("should throw RangeError for invalid IPv6 string", () => {
                expect(() => IPv6.fromString("2001:db8:85a3:0:0:8a2e:370:7334:1234")).to.throw(RangeError, /Expected valid IPv6 address/);
                expect(() => IPv6.fromString("invalid::address")).to.throw(RangeError, /Expected valid IPv6 address/);
            });
        });
    });

    describe("Instance Methods", () => {
        let ip;

        beforeEach(() => {
            //ip = new IPv6(0x0000_0000_0000_0000_0000_ffff_c633_642an);
            //ip = IPv6.fromString("::ffff:198.51.100.42");
            ip = new IPv6(281474007000106n)
        });

        it("should return binary representation of the IPv6 address", () => {
            const binary = ip.binary();
            expect(binary).to.deep.equal(new Uint16Array([0x0, 0x0, 0x0, 0x0, 0x0, 0xffff, 0xc633, 0x642a]));
        });

        it("should check for IPv4-mapped IPv6 address", () => {
            expect(ip.hasMappedIPv4()).to.be.true;
        });

        it("should return the mapped IPv4 address from IPv6", () => {
            const mappedIp = ip.getMappedIPv4();
            expect(mappedIp.toString()).to.equal("198.51.100.42");
        });

        it("should return string representation of the IPv6 address", () => {
            expect(ip.toString()).to.equal("::ffff:c633:642a");
        });
    });
});

