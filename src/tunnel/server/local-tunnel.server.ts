// Copyright (c) 2019-present, Anton Makarov <zer0c14@gmail.com>
// See the LICENSE for more information.

import net, { Socket } from 'net';
import { promisify } from 'util';
import { EventEmitter } from 'events';
import { Logger } from 'pino';
import { Client, Connection } from 'ssh2';

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
  sshClient: Client | Connection;
  forwardAddress: string;
  forwardPort: number;
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
  protected sshClient: Client | Connection;

  /**
   * Forward address.
   */
  protected forwardAddress: string;

  /**
   * Forward port.
   */
  protected forwardPort: number;

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
    this.forwardAddress = options.forwardAddress;
    this.forwardPort = options.forwardPort;
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

    const forwardOut = () => {
      const forwardOutResult: boolean = this.sshClient.forwardOut(
        socket.remoteAddress,
        socket.remotePort,
        this.forwardAddress,
        this.forwardPort,
        (error, stream) => {
          if (error) {
            socket.end();
            return this.logger.error(error);
          }
          stream.pipe(socket).pipe(stream);
          stream.once('close', () => socket.end());
        },
      );

      if (!forwardOutResult) {
        this.sshClient.once('continue', () => forwardOut());
      }
    };
    forwardOut();
  }
}
