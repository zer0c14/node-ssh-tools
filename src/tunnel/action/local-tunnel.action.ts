// Copyright (c) 2019-present, Anton Makarov <zer0c14@gmail.com>
// See the LICENSE for more information.

import { Logger } from 'pino';
import { inject, injectable } from 'inversify';
import { IConnectionActionParser } from '../..';
import { TYPES } from '../constant';
import { ITunnelService } from '../service';
import { ITunnelRuleActionParser } from './parser';

/**
 * Local tunnel action interface.
 */
export interface ILocalTunnelAction {
  handleAction(connectionString: string, tunnelRule: string): void;
}

/**
 * Local tunnel action.
 */
@injectable()
export class LocalTunnelAction implements ILocalTunnelAction {
  /**
   * Logger
   */
  @inject(TYPES.Logger)
  protected logger: Logger;

  /**
   * Tunnel service.
   */
  @inject(TYPES.TunnelService)
  protected tunnelService: ITunnelService;

  /**
   * Tunnel rule parser.
   */
  @inject(TYPES.TunnelRuleActionParser)
  protected tunnelRuleParser: ITunnelRuleActionParser;

  /**
   * Connection string parser.
   */
  @inject(TYPES.ConnectionActionParser)
  protected connectionStringParser: IConnectionActionParser;

  /**
   * Handles action.
   *
   * @param connectionString
   * @param tunnelRule
   */
  public handleAction(connectionString: string, tunnelRule: string): void {
    this.tunnelService
      .runLocalTunnel({
        ...this.tunnelRuleParser.parse(tunnelRule),
        ...this.connectionStringParser.parse(connectionString),
      })
      .catch(error => this.logger.error(error));
  }
}
