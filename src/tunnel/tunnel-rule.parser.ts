// Copyright (c) 2019-present, Anton Makarov <zer0c14@gmail.com>
// See the LICENSE for more information.

import { injectable } from 'inversify';

/**
 * Tunnel rule interface.
 */
export interface ITunnelRule {
  localAddress?: string;
  localPort: number;
  remoteAddress: string;
  remotePort: number;
}

/**
 * Tunnel rule parser interface.
 */
export interface ITunnelRuleParser {
  parse(value: string): ITunnelRule;
}

/**
 * Tunnel rule parser.
 */
@injectable()
export class TunnelRuleParser implements ITunnelRuleParser {
  /**
   * Tunnel rule string splitter.
   */
  protected splitter: RegExp | string = ':';

  /**
   * Parses tunnel rule string.
   *
   * @param value
   */
  public parse(value: string): ITunnelRule {
    const parts = value.split(this.splitter);
    if (parts.length < 3 || parts.length > 4) {
      throw new Error(`Tunnel rule is invalid (value=${value})`);
    }

    if (parts.length === 3) {
      return {
        localPort: Number(parts[0]),
        remoteAddress: parts[1],
        remotePort: Number(parts[2]),
      };
    }

    return {
      localAddress: parts[0],
      localPort: Number(parts[1]),
      remoteAddress: parts[2],
      remotePort: Number(parts[3]),
    };
  }
}
