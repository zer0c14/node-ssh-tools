// Copyright (c) 2019-present, Anton Makarov <zer0c14@gmail.com>
// See the LICENSE for more information.

import { injectable } from 'inversify';
import { IConsumerCommandContext, IConsumerCommandHandler } from '..';

/**
 * Put command handler.
 */
@injectable()
export class PutCommandHandler implements IConsumerCommandHandler {

  /**
   * @param argv
   * @param cwd
   * @param context
   */
  public async handleCommand(argv: string[], cwd: string, context: IConsumerCommandContext): Promise<void> {
    const [, localPath, remotePath = null ] = argv;

    await context.getSshClient().sftp().fastPut(localPath, remotePath);
    await context.endCommand();
  }
}
