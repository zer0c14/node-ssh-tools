// Copyright (c) 2019-present, Anton Makarov <zer0c14@gmail.com>
// See the LICENSE for more information.

import { injectable } from 'inversify';
import { IConsumerCommandHandler, IConsumerCommandContext } from '..';

/**
 * Get command handler.
 */
@injectable()
export class GetCommandHandler implements IConsumerCommandHandler {

  /**
   * @param argv
   * @param cwd
   * @param context
   */
  public async handleCommand(argv: string[], cwd: string, context: IConsumerCommandContext): Promise<void> {
    const [, remotePath, localPath = null ] = argv;

    // context.writeResponse('error', 'STDERR', 1);
    // throw new Error('ephemeralError');

    await context.getSshClient().sftp().fastGet(remotePath, localPath);
    await context.endCommand();
  }
}
