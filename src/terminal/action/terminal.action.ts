// Copyright (c) 2019-present, Anton Makarov <zer0c14@gmail.com>
// See the LICENSE for more information.

import { Logger } from 'pino';
import { inject, injectable } from 'inversify';
import { TYPES } from '../constant';
import { ITerminalService } from '../service';
import { IConnectionActionParser } from './parser';

/**
 * Terminal action interface.
 */
export interface ITerminalAction {
  handleAction(connectionString: string): void;
}

/**
 * Terminal action.
 */
@injectable()
export class TerminalAction {
  /**
   * Logger.
   */
  @inject(TYPES.Logger)
  protected logger: Logger;

  /**
   * Terminal service.
   */
  @inject(TYPES.TerminalService)
  protected terminalService: ITerminalService;

  /**
   * Connection string parser.
   */
  @inject(TYPES.ConnectionActionParser)
  protected connectionStringParser: IConnectionActionParser;

  /**
   * Handles terminal action.
   *
   * @param connectionString
   */
  public handleAction(connectionString: string): void {
    this.terminalService
      .runTerminal({
        stdin: process.stdin,
        stdout: process.stdout,
        stderr: process.stderr,
        ...this.connectionStringParser.parse(connectionString),
      })
      .catch(error => this.logger.error(error));
  }
}
