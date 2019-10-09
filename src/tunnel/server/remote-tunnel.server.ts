// Copyright (c) 2019-present, Anton Makarov <zer0c14@gmail.com>
// See the LICENSE for more information.

import net, { Socket } from 'net';
import {
  ILocalTunnelServer,
  ILocalTunnelServerOptions,
  LocalTunnelServer,
} from './local-tunnel.server';

/**
 * Remote tunnel server options interface.
 */
export type IRemoteTunnelServerOptions = ILocalTunnelServerOptions;

/**
 * Remote tunnel server interface.
 */
export type IRemoteTunnelServer = ILocalTunnelServer;

/**
 * Remote tunnel server.
 */
export class RemoteTunnelServer extends LocalTunnelServer
  implements IRemoteTunnelServer {
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
        this.forwardAddress,
        this.forwardPort,
        socket.remoteAddress,
        socket.remotePort,
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
