// Copyright (c) 2019-present, Anton Makarov <zer0c14@gmail.com>
// See the LICENSE for more information.

import { promisify } from 'util';
import net, { Socket } from 'net';
import { Logger } from 'pino';
import { inject, injectable } from 'inversify';
import { Client, ConnectConfig, Server, ServerConfig } from 'ssh2';
import { TYPES } from './tunnel.constant';
import { ISshClientHelper } from './client.helper';

/**
 * Run local tunnel options interface.
 */
export interface IRunLocalTunnelOptions extends ConnectConfig {
  localAddress?: string;
  localPort: number;
  remoteAddress: string;
  remotePort: number;
}

/**
 * Run remote tunnel options interface.
 */
export interface IRunRemoteTunnelOptions extends IRunLocalTunnelOptions {
  serverPort?: number;
  serverAddress?: string;
}

/**
 * Ssh client factory interface.
 */
export interface ITunnelServiceSshClientFactory {
  (): Client;
}

/**
 * Ssh server factory interface.
 */
export interface ITunnelServiceSshServerFactory {
  (options: ServerConfig): Server;
}

/**
 * Tcp server factory interface.
 */
export interface ITunnelServiceTcpServerFactory {
  (connectionListener?: (socket: Socket) => void): net.Server;
}

/**
 * Tunnel service interface.
 */
export interface ITunnelService {
  runLocalTunnel(options: IRunLocalTunnelOptions): Promise<Client>;
  runRemoteTunnel(options: IRunRemoteTunnelOptions): Promise<Server>;
}

/**
 * Tunnel service.
 */
@injectable()
export class TunnelService implements ITunnelService {
  /**
   * Logger.
   */
  @inject(TYPES.Logger)
  protected logger: Logger;

  /**
   * Ssh client helper.
   */
  @inject(TYPES.SshClientHelper)
  protected sshClientHelper: ISshClientHelper;

  /**
   * Tcp server factory.
   */
  @inject(TYPES.TcpServerFactory)
  protected tcpServerFactory: ITunnelServiceTcpServerFactory;

  /**
   * Ssh client factory.
   */
  @inject(TYPES.SshClientFactory)
  protected sshClientFactory: ITunnelServiceSshClientFactory;

  /**
   * Ssh server factory.
   */
  @inject(TYPES.SshServerFactory)
  protected sshServerFactory: ITunnelServiceSshServerFactory;

  /**
   * Runs local tunnel (ssh -L).
   *
   * @param options
   */
  public async runLocalTunnel(
    options: IRunLocalTunnelOptions,
  ): Promise<Client> {
    const sshClient = this.sshClientFactory();
    await this.sshClientHelper.connect(sshClient, options);

    this.logger.info(`Connection successful (host=${options.host})`);

    const { remoteAddress, remotePort } = options;
    const tcpServer = this.tcpServerFactory(socket => {
      this.sshClientHelper
        .forwardOut(sshClient, '', 0, remoteAddress, remotePort)
        .then(stream => {
          stream.pipe(socket).pipe(stream);
          stream.on('close', () => tcpServer.close());
        })
        .catch(error => this.logger.error(error));
    });
    tcpServer.on('close', () => sshClient.end());

    const listenTcpServer = promisify(tcpServer.listen.bind(tcpServer));
    await listenTcpServer(options.localPort, options.localAddress);

    this.logger.info(
      `Forwarded ${options.localAddress || ':'}:${options.localPort} ` +
        `to ${options.remoteAddress}:${options.remotePort} on ${options.host}`,
    );

    return sshClient;
  }

  /**
   * Runs local tunnel (ssh -R).
   *
   * @param options
   */
  public async runRemoteTunnel(
    options: IRunRemoteTunnelOptions,
  ): Promise<Server> {
    // @feature - hardcode implementation https://github.com/mscdex/ssh2/issues/698
    return this.sshServerFactory({ hostKeys: [] });
  }
}
