# @cldn/ip

IP address utility.

## Features

- Works in the browser and in Node.js without any polyfills. (A bundler like Webpack or Vite is recommended for the
    browser)
- IPv4 and IPv6 classes.
- Get IP address as BigInt, binary or string.
- Extract IPv4-mapped IPv6 addresses.
- Subnet class with methods to check IP membership, create netmask, list addresses, etc.
- Network class for working with multiple subnets.
- Written in TypeScript.

See the [**Documentation**](https://ip.cldn.pro)

## Installation

```sh
npm install @cldn/ip
```

## Usage

```ts
import {IPv4, IPv6, Subnet} from "@cldn/ip";

const ipv6 = IPv4.fromString("::ffff:192.168.1.42");
const ipv4 = ipv6.getMappedIPv4();

const subnet = Subnet.fromString("192.168.0.0/16");
subnet.has(ipv4); // true
```

## Licence

Copyright © 2024–2025 Cloudnode OÜ

This file is part of @cldn/ip.

@cldn/ip is free software: you can redistribute it and/or modify it under the terms of the GNU Lesser General
Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any
later version.

@cldn/ip is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied
warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more
details.
