// Copyright (c) 2019-present, Anton Makarov <zer0c14@gmail.com>
// See the LICENSE for more information.

import { Connection, SocketBindInfo, TcpipBindInfo } from 'ssh2';
import ShellClient from 'ssh2-shell-server/lib/shell-client';

/**
 * Request context interface.
 */
export interface IShellClientRequestContext {
  client: BaselShellClient;
  accept: (chosenPort?: number) => void;
  reject: () => void;
  name: 'tcpip-forward' | 'cancel-tcpip-forward';
  info: TcpipBindInfo;
}

/**
 * Base shell client.
 */
export class BaselShellClient extends ShellClient {
  /**
   * Handles ready event.
   */
  protected _handleReady() {
    this._client.once('session', this._handleSession.bind(this));
    this._client.once('request', this._handleRequest.bind(this));
  }

  /**
   * Returns connection.
   */
  public getConnection(): Connection {
    return this._client;
  }

  /**
   * Handles request event.
   *
   * @param accept
   * @param reject
   * @param name
   * @param info
   */
  protected _handleRequest(
    accept: (chosenPort?: number) => void,
    reject: () => void,
    name: string,
    info: TcpipBindInfo | SocketBindInfo,
  ) {
    this.emit('request', {
      name: name,
      info: info,
      accept: accept,
      reject: reject,
      client: this,
    });
  }
}
