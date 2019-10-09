// Copyright (c) 2019-present, Anton Makarov <zer0c14@gmail.com>
// See the LICENSE for more information.

import { injectable } from 'inversify';
import { IConsumerCommandContext } from './context.command';

/**
 * Command handler interface.
 */
export interface IConsumerCommandHandler {
  handleCommand(
    argv: string[],
    cwd: string,
    context: IConsumerCommandContext,
  ): Promise<void>;
}

/**
 * Command dispatcher interface.
 */
export interface IConsumerCommandDispatcher {
  dispatch(
    argv: string[],
    cwd: string,
    context: IConsumerCommandContext,
  ): Promise<void>;
}

/**
 * Command dispatcher options interface.
 */
export interface IConsumerCommandDispatcherOptions {
  handlers?: { [name: string]: IConsumerCommandHandler };
}

/**
 * Standard command dispatcher.
 */
@injectable()
export class ConsumerCommandDispatcher implements IConsumerCommandDispatcher {
  /**
   * Command handlers.
   */
  protected handlers: { [p: string]: IConsumerCommandHandler } = {};

  /**
   * Constructor.
   *
   * @param options
   */
  public constructor(options: IConsumerCommandDispatcherOptions = {}) {
    this.handlers = options.handlers || this.handlers;
  }

  /**
   * Dispatches command queue message.
   *
   * @param argv
   * @param cwd
   * @param context
   */
  public async dispatch(
    argv: string[],
    cwd: string,
    context: IConsumerCommandContext,
  ) {
    const [cmd] = argv;
    if (!this.handlers[cmd]) {
      throw new Error(`Command handler found (cmd=${cmd})`);
    }

    return this.handlers[cmd].handleCommand(argv, cwd, context);
  }
}
