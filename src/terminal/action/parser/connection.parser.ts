// Copyright (c) 2019-present, Anton Makarov <zer0c14@gmail.com>
// See the LICENSE for more information.

import os from 'os';
import { injectable } from 'inversify';
import { ConnectionString } from 'connection-string';

/**
 * Connection parser result interface.
 */
export interface IConnectionActionParserResult {
  host: string;
  port: number;
  username: string;
  password: string;
}

/**
 * Connection action parser interface.
 */
export interface IConnectionActionParser {
  parse(value: string): IConnectionActionParserResult;
}

/**
 * Connection action parser.
 */
@injectable()
export class ConnectionActionParser implements IConnectionActionParser {
  /**
   * Parse connection string.
   *
   * @param value
   */
  parse(value: string): IConnectionActionParserResult {
    const connectionString = new ConnectionString(value, {
      hosts: [{ name: 'localhost', port: 22 }],
      user: os.userInfo().username,
    });

    if (!connectionString.password) {
      throw new Error(`Connection string is invalid (value=${value})`);
    }

    return {
      host: connectionString.hostname,
      port: connectionString.port,
      username: connectionString.user,
      password: connectionString.password,
    };
  }
}
