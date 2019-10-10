// Copyright (c) 2019-present, Anton Makarov <zer0c14@gmail.com>
// See the LICENSE for more information.

import { Logger } from 'pino';
import { inject, injectable } from 'inversify';
import { Client, ConnectConfig, Server, ServerConfig } from 'ssh2';
import { TYPES } from './tunnel.constant';
import { ISshClientHelper } from './client.helper';
import { ILocalTunnelServer } from './tunnel.server';

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
 *  Local tunnel server factory options interface.
 */
export interface ITunnelServiceLocalTunnelServerFactoryOptions {
  logger?: Logger;
  sshClient: Client;
  remoteAddress: string;
  remotePort: number;
}

/**
 * Local tunnel server factory interface.
 */
export interface ITunnelServiceLocalTunnelServerFactory {
  (options: ITunnelServiceLocalTunnelServerFactoryOptions): ILocalTunnelServer;
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
  @inject(TYPES.LocalTunnelServerFactory)
  protected localTunnelServerFactory: ITunnelServiceLocalTunnelServerFactory;

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

    await this.localTunnelServerFactory({
      sshClient: sshClient,
      remoteAddress: options.remoteAddress,
      remotePort: options.remotePort,
    }).listen(options.localPort, options.localAddress);

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
