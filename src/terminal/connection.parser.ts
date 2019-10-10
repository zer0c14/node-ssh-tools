// Copyright (c) 2019-present, Anton Makarov <zer0c14@gmail.com>
// See the LICENSE for more information.

import os from 'os';
import { injectable } from 'inversify';
import { ConnectionString } from 'connection-string';

/**
 * Connection string interface.
 */
export interface IConnectionString {
  host: string;
  port: number;
  username: string;
  password: string;
}

/**
 * Connection string parser interface.
 */
export interface IConnectionStringParser {
  parse(value: string): IConnectionString;
}

/**
 * Connection string parser.
 */
@injectable()
export class ConnectionStringParser implements IConnectionStringParser {
  /**
   * Parse connection string.
   *
   * @param value
   */
  parse(value: string): IConnectionString {
    
    const defaults = {
        hosts: [{name: 'localhost', port: 22}],
        user: os.userInfo().username
    };
    
    const connectionString = new ConnectionString(value, defaults);

    if (
      connectionString.protocol ||
      !connectionString.hosts ||
      connectionString.hosts.length !== 1
    ) {
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
