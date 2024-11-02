import {IPAddress, IPv4, Subnet} from "./index.js";

/**
 * An IPv6 address
 */
export class IPv6 extends IPAddress {
    public static bitLength = 128;

    /**
     * Create new IPv6 address instance
     */
    public constructor(value: bigint) {
        if (value < 0n || value > 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFn)
            throw new TypeError("Expected 128-bit unsigned integer, got " + value.constructor.name + " 0x" + value.toString(16));
        super(value);
    }

    /**
     * Create an IPv6 address instance from hextets
     * @throws {@link !RangeError} If provided hextets are not 8
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
     * Create an IPv6 address instance from string
     * @throws {@link !RangeError} If provided string is not a valid IPv6 address
     */
    public static override fromString(str: string): IPv6 {
        const parts = str.split("::", 2);
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
        ) throw new RangeError("Expected valid IPv6 address, got " + str);

        const hextets = new Uint16Array(8);
        hextets.set(hextestStart, 0);
        hextets.set(hextestEnd, 8 - hextestEnd.length);

        return IPv6.fromBinary(hextets);
    }

    /**
     * Parse string hextet into unsigned 16-bit integer
     * @internal
     */
    private static parseHextet(hextet: string): number | number[] {
        return IPv4.regex.test(hextet)
            ? Array.from(new Uint16Array(IPv4.fromString(hextet).binary().buffer))
            : Number.parseInt(hextet, 16);
    }

    /**
     * Get the 8 hextets of the IPv6 address
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
     * Check whether this is an IPv4-mapped IPv6 address.
     * Only works for `::ffff:0:0/96`
     */
    public hasMappedIPv4(): boolean {
        return Subnet.IPV4_MAPPED_IPV6.has(this);
    }

    /**
     * Get the IPv4-mapped IPv6 address.
     * Returns the last 32 bits as an IPv4 address.
     * @see {@link IPv6#hasMappedIPv4}
     */
    public getMappedIPv4(): IPv4 {
        return IPv4.fromBinary(new Uint8Array(this.binary().buffer).slice(-4));
    }

    public override toString(): string {
        const str = Array.from(this.binary()).map(octet => octet.toString(16)).join(":");
        const longest = str.match(/(?:^|:)0(?::0)+(?:$|:)/g)?.reduce((acc, cur) => cur.length > acc.length ? cur : acc, "") ?? null;
        if (longest === null) return str;
        return str.replace(longest, "::");
    }
}
