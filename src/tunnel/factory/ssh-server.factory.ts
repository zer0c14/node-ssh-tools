// Copyright (c) 2019-present, Anton Makarov <zer0c14@gmail.com>
// See the LICENSE for more information.

import { Logger } from 'pino';
import { inject, injectable, interfaces } from 'inversify';
import { Authenticators } from 'ssh2-shell-server';
import { TYPES } from '../constant';
import { TunnelShellServer, ITunnelShellServerOptions } from '../server';
import { IRemoteTunnelServerFactory } from './remote-tunnel.server';

/**
 * Ssh server factory options interface.
 */
export interface ISshServerFactoryOptions
  extends Omit<
    ITunnelShellServerOptions,
    'logger' | 'remoteTunnelServerFactory'
  > {
  logger?: Logger;
  remoteTunnelServerFactory?: IRemoteTunnelServerFactory;
}

/**
 * Ssh server factory interface.
 */
export interface ISshServerFactory {
  createServer(options: ISshServerFactoryOptions): TunnelShellServer;
}

/**
 * Ssh server factory options.
 */
@injectable()
export class SshServerFactory implements ISshServerFactory {
  /**
   * Logger.
   */
  @inject(TYPES.Logger)
  protected logger: Logger;

  /**
   * Server constructor.
   */
  @inject(TYPES.SshServerClass)
  protected serverClass: interfaces.Newable<TunnelShellServer>;

  /**
   * Remote tunnel server factory.
   */
  @inject(TYPES.RemoteTunnelServerFactory)
  protected remoteTunnelServerFactory: IRemoteTunnelServerFactory;

  /**
   * Create server instance.
   *
   * @param options
   */
  public createServer(options: ISshServerFactoryOptions): TunnelShellServer {
    const { logger, remoteTunnelServerFactory } = this;
    const sshServer = new this.serverClass({
      logger,
      remoteTunnelServerFactory,
      ...options,
    });

    // @feature - real public key authenticator
    // 1) generate key pair on server or client (ssh-keygen/crypto)
    // 2) put key pair in session directory on server (/tmp/.../id_rsa)
    // 3) add public key in next-gen authenticator
    // 4) ssh -i on server with key pair session directory. Done!
    sshServer.registerAuthenticator(
      new Authenticators.AuthenticateByPublicKey(() => true, () => true),
    );

    return sshServer;
  }
}
