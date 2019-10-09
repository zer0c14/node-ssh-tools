// Copyright (c) 2019-present, Anton Makarov <zer0c14@gmail.com>
// See the LICENSE for more information.

import { Client, ClientChannel, ConnectConfig, Connection } from 'ssh2';

/**
 * Ssh client helper interface.
 */
export interface ISshClientHelper {
  connect(sshClient: Client, connectConfig: ConnectConfig): Promise<Client>;
  forwardOut(
    client: Client | Connection,
    srcIp: string,
    srcPort: number,
    dstIp: string,
    dstPort: number,
  ): Promise<ClientChannel>;
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

  /**
   * @param client
   * @param srcIp
   * @param srcPort
   * @param dstIp
   * @param dstPort
   */
  public static forwardOut(
    client: Client,
    srcIp: string,
    srcPort: number,
    dstIp: string,
    dstPort: number,
  ): Promise<ClientChannel> {
    return new Promise((resolve, reject) => {
      client.forwardOut(srcIp, srcPort, dstIp, dstPort, (error, stream) =>
        error !== null ? resolve(stream) : reject(error),
      );
    });
  }
}
