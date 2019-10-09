// Copyright (c) 2019-present, Anton Makarov <zer0c14@gmail.com>
// See the LICENSE for more information.

import { promisify } from 'util';
import { generateKeyPair } from 'crypto';
import { Logger } from 'pino';
import { inject, injectable } from 'inversify';
import { Client, ConnectConfig } from 'ssh2';
import { TYPES } from '../constant';
import { ITunnelRuleActionParserResult } from '../action';
import { TunnelShellServer } from '../server';
import { ISshClientHelper } from '../helper';
import {
  ISshClientFactory,
  ISshServerFactory,
  ILocalTunnelServerFactory,
  IRemoteTunnelServerFactory,
} from '../factory';

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
 * Tunnel service interface.
 */
export interface ITunnelService {
  runLocalTunnel(options: IRunLocalTunnelOptions): Promise<Client>;
  runRemoteTunnel(options: IRunRemoteTunnelOptions): Promise<TunnelShellServer>;
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
   * Generate key pair promise.
   */
  protected _generateKeyPair = promisify(generateKeyPair);

  /**
   * Local tunnel server factory.
   */
  @inject(TYPES.LocalTunnelServerFactory)
  protected localTunnelServerFactory: ILocalTunnelServerFactory;

  /**
   * Remote tunnel server factory.
   */
  @inject(TYPES.RemoteTunnelServerFactory)
  protected remoteTunnelServerFactory: IRemoteTunnelServerFactory;

  /**
   * Ssh client factory.
   */
  @inject(TYPES.SshClientFactory)
  protected sshClientFactory: ISshClientFactory;

  /**
   * Ssh client helper.
   */
  @inject(TYPES.SshClientHelper)
  protected sshClientHelper: ISshClientHelper;

  /**
   * Ssh server factory.
   */
  @inject(TYPES.SshServerFactory)
  protected sshServerFactory: ISshServerFactory;

  /**
   * Runs local port tunnel.
   *
   * @param options
   */
  public async runLocalTunnel(
    options: IRunLocalTunnelOptions,
  ): Promise<Client> {
    const sshClient = this.sshClientFactory.createClient();
    await this.sshClientHelper.connect(sshClient, options);

    this.logger.info(`Connection successful (host=${options.host})`);

    await this.localTunnelServerFactory
      .createServer({
        sshClient: sshClient,
        forwardAddress: options.remoteAddress,
        forwardPort: options.remotePort,
      })
      .listen(options.localPort, options.localAddress);

    this.logger.info(
      `Forwarded ${options.localAddress || '::'}:${options.localPort} ` +
        `to ${options.remoteAddress}:${options.remotePort} on ${options.host}`,
    );

    return sshClient;
  }

  /**
   * Runs remote port tunnel.
   *
   * @param options
   */
  public async runRemoteTunnel(
    options: IRunRemoteTunnelOptions,
  ): Promise<TunnelShellServer> {
    const sshServer = this.sshServerFactory.createServer({
      hostKeys: await this.generateSshServerHostKeys(),
      port: options.serverPort,
      address: options.serverAddress,
    });

    await sshServer.listen();
    const { address, port } = sshServer.address();
    this.logger.info(`Listening ssh server on ${address}:${port}...`);

    const sshClient = this.sshClientFactory.createClient();
    await this.sshClientHelper.connect(sshClient, options);
    sshClient.on('close', () =>
      sshServer.close().catch(error => this.logger.error(error)),
    );

    const tunnelRule = this.tunnelRuleToString(options);
    const tunnelCommand =
      `ssh -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no -q ` +
      `-R ${tunnelRule} ${address} -p ${port}`;

    const stream = await this.sshClientHelper.spawn(sshClient, tunnelCommand);
    stream.on('close', () => sshClient.end());
    stream.pipe(process.stdout);

    this.logger.info(
      `Forwarded ${options.localAddress || '::'}:${options.localPort} ` +
        `to ${options.remoteAddress}:${options.remotePort} on ${options.host}`,
    );

    return sshServer;
  }

  /**
   * Generates ssh server host keys.
   *
   * @param modulusLength
   */
  protected async generateSshServerHostKeys(
    modulusLength: number = 4096,
  ): Promise<[string | Buffer]> {
    const keyPair = await this._generateKeyPair('rsa', { modulusLength });
    return [keyPair.privateKey.export({ format: 'pem', type: 'pkcs1' })];
  }

  /**
   * Converts tunnel rule to string.
   *
   * @param tunnelRule
   */
  protected tunnelRuleToString(
    tunnelRule: ITunnelRuleActionParserResult,
  ): string {
    const tunnelRuleParts = [
      tunnelRule.localPort,
      tunnelRule.remoteAddress,
      tunnelRule.remotePort,
    ];

    if (tunnelRule.localAddress) {
      tunnelRuleParts.unshift(tunnelRule.localAddress);
    }

    return tunnelRuleParts.join(':');
  }
}
