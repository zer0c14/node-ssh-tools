// Copyright (c) 2019-present, Anton Makarov <zer0c14@gmail.com>
// See the LICENSE for more information.

import { promisify } from 'util';
import { Connection, Server } from 'ssh2';
import { IShellServerOptions, ShellServer } from 'ssh2-shell-server';
import { BaselShellClient, IShellClientRequestContext } from './client.shell';

/**
 * Base shell server options interface.
 */
export interface IBaseShellServerOptions extends IShellServerOptions {
  address?: string;
}

/**
 * Base shell server.
 */
export class BaseShellServer extends ShellServer {
  /**
   * Ssh server.
   */
  protected server: Server;

  /**
   * Close server promise.
   */
  protected closeServer: () => Promise<void>;

  /**
   * Configuration.
   */
  protected _configuration: IBaseShellServerOptions;

  /**
   * Handles incoming connection.
   *
   * @param client
   */
  protected _handleIncoming(client: Connection) {
    const clientAuthenticators = { ...this._authenticators };
    const shellClient = new BaselShellClient(client, clientAuthenticators);

    shellClient.on('request', this._handleRequest.bind(this));
    shellClient.on('session-created', this._handleSessionCreated.bind(this));
    shellClient.on('session-ended', this._handleSessionEnded.bind(this));
    shellClient.on('error', this._handleSessionError.bind(this));
  }

  /**
   * Returns server address.
   */
  public address(): { port: number; family: string; address: string } {
    return this.server.address();
  }

  /**
   * Listens ssh server.
   */
  public async listen(): Promise<void> {
    const { hostKeys, port, address } = this._configuration;
    this.server = new Server({ hostKeys }, this._handleIncoming.bind(this));
    this.closeServer = promisify(this.server.close.bind(this.server));

    return new Promise((resolve, reject) => {
      this.server.listen(port, address, (error = null) =>
        error ? reject(error) : resolve(),
      );
    });
  }

  /**
   * Closes server.
   */
  public async close(): Promise<void> {
    return this.closeServer();
  }

  /**
   * Handles incoming client request.
   *
   * @param requestContext
   */
  protected _handleRequest(requestContext: IShellClientRequestContext): void {
    this.emit('request', requestContext);
  }
}
