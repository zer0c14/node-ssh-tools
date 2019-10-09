// Copyright (c) 2019-present, Anton Makarov <zer0c14@gmail.com>
// See the LICENSE for more information.

import { injectable } from 'inversify';

/**
 * Consumer command parser interface.
 */
export interface IConsumerCommandParser {
  parse(value: string): string[];
}

/**
 * Consumer command parser.
 */
@injectable()
export class ConsumerCommandParser implements IConsumerCommandParser {
  /**
   * Command splitter.
   */
  protected splitter: RegExp | string = String.fromCharCode(0x03);

  /**
   * Parses command to parts.
   *
   * @param value
   */
  public parse(value: string): string[] {
    return value.split(this.splitter);
  }
}
