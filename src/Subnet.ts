import {IPAddress, IPv4, IPv6} from "./index.js";

/**
 * A subnet of IP addresses
 * @typeParam T IP address family
 */
export class Subnet<T extends IPv4 | IPv6> implements Iterable<T> {
    /**
     * IPv4-mapped IPv6 subnet
     */
    public static readonly IPV4_MAPPED_IPV6 = Subnet.fromCIDR("::ffff:0.0.0.0/96");

    /**
     * Subnet address (i.e. the first/gateway IP address of the network)
     */
    public readonly address: T;

    /**
     * IP address constructor
     */
    readonly #AddressClass: typeof IPv4 | typeof IPv6;

    /**
     * Create new subnet instance
     * @param address An IP address
     * @param suffix Subnet suffix bits
     * @throws {@link !RangeError} If the suffix is greater than the IP address family bit-length
     */
    public constructor(address: T, public readonly suffix: number) {
        this.#AddressClass = address.constructor as typeof IPv4 | typeof IPv6;
        if (suffix > this.#AddressClass.bitLength) throw new RangeError("Expected suffix less than " + this.#AddressClass.bitLength + ", got " + suffix);
        this.address = new this.#AddressClass(address.value & this.netmask()) as T;
    }

    /**
     * Create subnet from string in CIDR notation
     * @throws {@link !RangeError} If the address or suffix is invalid
     */
    public static fromCIDR(cidr: string): Subnet<IPv4 | IPv6> {
        const parts = cidr.split("/", 2);
        if (parts.length !== 2) throw new RangeError("Expected CIDR notation, got " + cidr);
        const suffix = Number.parseInt(parts[1]!, 10);
        return new Subnet<IPv4 | IPv6>(IPAddress.fromString(parts[0]!), suffix);
    }

    /**
     * Get the network mask
     */
    public netmask(): bigint {
        return ((1n << BigInt(this.suffix)) - 1n) << BigInt(this.#AddressClass.bitLength - this.suffix);
    }

    /**
     * Get the network wildcard mask
     */
    public wildcard(): bigint {
        return ((1n << BigInt(this.#AddressClass.bitLength - this.suffix)) - 1n);
    }

    /**
     * Get the last IP address in the subnet (i.e. broadcast address)
     */
    public broadcast(): T {
        return new this.#AddressClass(this.address.value | this.wildcard()) as T;
    }

    /**
     * Check if the provided IP address is in this subnet
     */
    public has(address: T): boolean {
        if (!(address instanceof this.#AddressClass)) return false;
        return (address.value & this.netmask()) === this.address.value;
    }

    /**
     * Get the number of addresses in this subnet.
     * This number includes the broadcast and gateway addresses, so for the
     * number of *usable* addresses, subtract 2.
     */
    public size(): bigint {
        return this.wildcard() + 1n;
    }

    /**
     * Iterate all IP addresses in this subnet
     *
     * **NOTE**: This can be slow for large subnets. If you need to check if an
     * IP address is in the subnet, use {@link Subnet#contains}.
     */
    public* iterate(): IterableIterator<T> {
        for (let i = this.address.value; i <= this.broadcast().value; ++i) yield new this.#AddressClass(i) as T;
    }

    /**
     * Iterate all IP addresses in this subnet
     *
     * **NOTE**: This can be slow for large subnets. If you need to check if an
     * IP address is in the subnet, use {@link Subnet#contains}.
     */
    public [Symbol.iterator](): IterableIterator<T> {
        return this.iterate();
    }

    /**
     * A set containing all IP addresses in this subnet
     *
     * **NOTE**: This can be slow for large subnets. If you need to check if an
     * IP address is in the subnet, use {@link Subnet#contains}.
     */
    public set(): Set<T> {
        return new Set(this.iterate());
    }

    /**
     * String representation of this subnet in CIDR notation
     * @example "203.0.113.0/24"
     */
    public toString(): string {
        return this.address.toString() + "/" + this.suffix;
    }
}
