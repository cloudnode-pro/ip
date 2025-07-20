# @cldn/ip

[![Documentation](https://img.shields.io/badge/Documentation-blue)](https://ip.cldn.pro)
[![GitHub](https://img.shields.io/badge/GitHub-181717?logo=github)](https://github.com/cloudnode-pro/ip)
[![NPM](https://img.shields.io/npm/v/@cldn/ip.svg)](https://www.npmjs.com/package/@cldn/ip)
[![Downloads](https://img.shields.io/npm/d18m/@cldn/ip.svg)](https://www.npmjs.com/package/@cldn/ip)
[![Licence](https://img.shields.io/github/license/cloudnode-pro/ip)](https://github.com/cloudnode-pro/ip/blob/master/COPYING)
[![CI](https://github.com/cloudnode-pro/ip/actions/workflows/ci.yml/badge.svg)](https://github.com/cloudnode-pro/ip/actions/workflows/ci.yml)
![Coverage: 100%](https://img.shields.io/badge/coverage-100%25-brightgreen)

A modern, object-oriented TypeScript library for representing and performing arithmetic on IP addresses and subnets.

[**Documentation — API Reference**](https://ip.cldn.pro)

## Usage

### Node.js

Install with `npm`:

```sh
npm install @cldn/ip
```

Import and use:

```ts
import {IPv4, IPv6, Subnet} from "@cldn/ip";
```

### Deno

Import the package from npm using the standard prefix:

```ts
import {IPv4, IPv6, Subnet} from "npm:@cldn/ip";
```

### Browsers

For browser usage, it is recommended to use a bundler like [Vite](https://vitejs.dev/),
or [Webpack](https://webpack.js.org/). If you are using a bundler, follow the same usage as for Node.js.

Alternatively, you can import the library as
a [JavaScript module](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)
from [ESM>CDN](https://esm.sh/):

```html

<script type="module">
  import {IPv4, IPv6, Subnet} from "https://esm.sh/@cldn/ip";
</script>
```

## Features

- Object-oriented representation of IPv4 and IPv6 addresses, and subnets.
- Comprehensive subnet arithmetic operations (e.g., containment, splitting, merging).
- Support for CIDR notation for defining and parsing subnets.
- Easy definition and manipulation of networks and collections of subnets.
- Support for IPv4-mapped IPv6 addresses.
- Fully documented, fully typed, and thoroughly tested with 100% coverage.
- Zero dependencies; compatible with frontend and backend environments without requiring polyfills.

## Example

```ts
import {IPv4, Subnet} from "@cldn/ip";

// Parse IPv4 address
const ip = IPv4.fromString("213.0.113.42");
// Or use IPAddress.fromString("213.0.113.42") to parse either IPv4 or IPv6

// Create subnet from CIDR notation
const subnet = Subnet.fromCIDR("213.0.113.0/24");

// Check if IP is within subnet
console.log(subnet.contains(ip)); // true
```

## Contact

For bugs, or feature requests, please use [GitHub Issues](https://github.com/cloudnode-pro/ip/issues).

For real-time chat or community discussions, join our Matrix
space: [#community\:cloudnode.pro](https://matrix.to/#/%23community:cloudnode.pro).

## Licence

Copyright © 2024–2025 Cloudnode OÜ.

This project is licensed under the terms of the [LGPL-3.0](https://github.com/cloudnode-pro/ip/blob/master/COPYING) licence.
