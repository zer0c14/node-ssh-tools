// Copyright (c) 2019-present, Anton Makarov <zer0c14@gmail.com>
// See the LICENSE for more information.

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
