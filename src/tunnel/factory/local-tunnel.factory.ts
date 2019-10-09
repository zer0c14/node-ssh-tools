// Copyright (c) 2019-present, Anton Makarov <zer0c14@gmail.com>
// See the LICENSE for more information.

import { Logger } from 'pino';
import { inject, injectable, interfaces } from 'inversify';
import { TYPES } from '../constant';
import { ILocalTunnelServer, ILocalTunnelServerOptions } from '../server';

/**
 * Local tunnel server factory options interface.
 */
export interface ILocalTunnelServerFactoryOptions
  extends Omit<ILocalTunnelServerOptions, 'logger'> {
  logger?: Logger;
}

/**
 * Local tunnel server factory interface.
 */
export interface ILocalTunnelServerFactory {
  createServer(options: ILocalTunnelServerFactoryOptions): ILocalTunnelServer;
}

/**
 * Local tunnel server factory.
 */
@injectable()
export class LocalTunnelServerFactory {
  /**
   * Logger.
   */
  @inject(TYPES.Logger)
  protected logger: Logger;

  /**
   * Server constructor.
   */
  @inject(TYPES.LocalTunnelServerClass)
  protected serverClass: interfaces.Newable<ILocalTunnelServer>;

  /**
   * Creates server instance.
   *
   * @param options
   */
  public createServer(
    options: ILocalTunnelServerFactoryOptions,
  ): ILocalTunnelServer {
    const logger = this.logger;
    return new this.serverClass({ logger, ...options });
  }
}
