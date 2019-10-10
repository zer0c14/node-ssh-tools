// Copyright (c) 2019-present, Anton Makarov <zer0c14@gmail.com>
// See the LICENSE for more information.

import { Client, ConnectConfig } from 'ssh2';

/**
 * Ssh client helper interface.
 */
export interface ISshClientHelper {
  connect(sshClient: Client, connectConfig: ConnectConfig): Promise<Client>;
}

/**
 * Ssh client helper.
 */
export class SshClientHelper {
  /**
   * @param client
   * @param connectConfig
   */
  public static connect(
    client: Client,
    connectConfig: ConnectConfig,
  ): Promise<Client> {
    let connectionError = null;
    return new Promise((resolve, reject) => {
      client
        .on('ready', () => resolve(client))
        .on('error', error => (connectionError = error))
        .on('close', () => reject(connectionError))
        .connect(connectConfig);
    });
  }
}
