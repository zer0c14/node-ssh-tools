// Copyright (c) 2019-present, Anton Makarov <zer0c14@gmail.com>
// See the LICENSE for more information.

import { Logger } from 'pino';
import { inject, injectable, interfaces } from 'inversify';
import { TYPES } from '../constant';
import { IRemoteTunnelServer, IRemoteTunnelServerOptions } from '../server';

/**
 * Remote tunnel server factory options interface.
 */
export interface IRemoteTunnelServerFactoryOptions
  extends Omit<IRemoteTunnelServerOptions, 'logger'> {
  logger?: Logger;
}

/**
 * Remote tunnel server factory interface.
 */
export interface IRemoteTunnelServerFactory {
  createServer(options: IRemoteTunnelServerFactoryOptions): IRemoteTunnelServer;
}

/**
 * Remote tunnel server factory.
 */
@injectable()
export class RemoteTunnelServerFactory {
  /**
   * Logger.
   */
  @inject(TYPES.Logger)
  protected logger: Logger;

  /**
   * Server constructor.
   */
  @inject(TYPES.RemoteTunnelServerClass)
  protected serverClass: interfaces.Newable<IRemoteTunnelServer>;

  /**
   * Creates server instance.
   *
   * @param options
   */
  public createServer(
    options: IRemoteTunnelServerOptions,
  ): IRemoteTunnelServer {
    const { logger } = this;
    return new this.serverClass({ logger, ...options });
  }
}
