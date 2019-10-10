// Copyright (c) 2019-present, Anton Makarov <zer0c14@gmail.com>
// See the LICENSE for more information.

import net, { Socket } from 'net';
import { promisify } from 'util';
import { EventEmitter } from 'events';
import { Logger } from 'pino';
import { Client } from 'ssh2';

/**
 * Local tunnel server interface.
 */
export interface ILocalTunnelServer extends EventEmitter {
  listen(port: number, address: string): Promise<void>;
  close(): Promise<void>;
}

/**
 * Local tunnel server options interface.
 */
export interface ILocalTunnelServerOptions {
  logger: Logger;
  sshClient: Client;
  remoteAddress: string;
  remotePort: number;
}

/**
 * Local tunnel server.
 */
export class LocalTunnelServer extends EventEmitter
  implements ILocalTunnelServer {
  protected logger: Logger;

  /**
   * Server.
   */
  protected server: net.Server;

  /**
   * Close server promise.
   */
  protected closeServer: () => Promise<void>;

  /**
   * Listen server promise.
   */
  protected listenServer: (port: number, address: string) => Promise<void>;

  /**
   * Ssh client.
   */
  protected sshClient: Client;

  /**
   * Remote address.
   */
  protected remoteAddress: string;

  /**
   * Remote port.
   */
  protected remotePort: number;

  /**
   * Constructor.
   *
   * @param options
   */
  public constructor(options: ILocalTunnelServerOptions) {
    super();

    this.server = net.createServer(this.handleConnection.bind(this));
    this.server.on('close', this.handleClose.bind(this));

    this.closeServer = promisify(this.server.close.bind(this.server));
    this.listenServer = promisify(this.server.listen.bind(this.server));

    this.logger = options.logger;
    this.sshClient = options.sshClient;
    this.remoteAddress = options.remoteAddress;
    this.remotePort = options.remotePort;
  }

  /**
   * Listens local tunnel server.
   */
  async listen(port: number, address: string): Promise<void> {
    return this.listenServer(port, address);
  }

  /**
   * Closes local tunnel server.
   */
  async close(): Promise<void> {
    return this.closeServer();
  }

  /**
   * Handles close event.
   */
  public handleClose(): void {
    this.sshClient.end();
  }

  /**
   * Handles a new connection to server.
   *
   * @param socket
   */
  public handleConnection(socket: Socket): void {
    const socketAddress = socket.address() as net.AddressInfo;
    this.logger.debug(
      `Server handles connection ` +
        `(address=${socketAddress.address}, port=${socketAddress.port})`,
    );

    const { remoteAddress: address, remotePort: port } = this;
    const forwardOut = () =>
      this.sshClient.forwardOut('', 0, address, port, (error, stream) => {
        if (error) return this.logger.error(error);
        stream.pipe(socket).pipe(stream);
        stream.on('close', () => this.server.close());
      });

    if (!forwardOut()) {
      this.sshClient.once('continue', () => this.handleConnection(socket));
    }
  }
}
