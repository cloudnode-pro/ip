import {IPv4, IPv6} from "./index.js";

/**
 * An IP address
 */
export abstract class IPAddress {
    /**
     * The integer representation of the IP address
     */
    public readonly value: bigint;

    /**
     * Create new IP address instance
     */
    protected constructor(value: bigint) {
        this.value = value;
    }

    /**
     * Create IP address from string
     * @throws {@link !RangeError} If provided string is not a valid IPv4 or IPv6 address
     */
    public static fromString(str: string): IPv4 | IPv6 {
        if (str.includes(":")) return IPv6.fromString(str);
        return IPv4.fromString(str);
    }

    /**
     * Get IP address binary representation
     */
    public abstract binary(): ArrayBuffer;

    /**
     * Check if the given addresses are equal
     */
    public equals(other: IPAddress): boolean {
        return other instanceof this.constructor && other.value === this.value;
    }

    /**
     * Format IP address as string
     */
    public abstract toString(): string;
}
