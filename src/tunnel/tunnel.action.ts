// Copyright (c) 2019-present, Anton Makarov <zer0c14@gmail.com>
// See the LICENSE for more information.

import { Logger } from 'pino';
import { inject, injectable } from 'inversify';
import { IConnectionStringParser } from '..';
import { TYPES } from './tunnel.constant';
import { ITunnelService } from './tunnel.service';
import { ITunnelRuleParser } from './tunnel-rule.parser';

/**
 * Tunnel action interface.
 */
export interface ITunnelAction {
  handleAction(connectionString: string, tunnelRule: string): Promise<void>;
}

/**
 * Tunnel action.
 */
@injectable()
export class TunnelAction {
  /**
   * Logger.
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
  @inject(TYPES.TunnelRuleParser)
  protected tunnelRuleParser: ITunnelRuleParser;

  /**
   * Connection string parser.
   */
  @inject(TYPES.ConnectionStringParser)
  protected connectionStringParser: IConnectionStringParser;

  /**
   * Handles local tunnel action.
   *
   * @param connectionString
   * @param tunnelRule
   */
  public handleAction(connectionString: string, tunnelRule: string): void {
    this.tunnelService
      .runLocalTunnel({
        ...this.tunnelRuleParser.parse(tunnelRule),
        ...this.connectionStringParser(connectionString),
      })
      .catch(error => this.logger.error(error));
  }
}
