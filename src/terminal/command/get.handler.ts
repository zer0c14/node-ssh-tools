// Copyright (c) 2019-present, Anton Makarov <zer0c14@gmail.com>
// See the LICENSE for more information.

import path from 'path';
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
  public async handleCommand(
    argv: string[],
    cwd: string,
    context: IConsumerCommandContext,
  ): Promise<void> {
    let [, remotePath, localPath] = argv;
    if (!remotePath || !remotePath.trim()) {
      await context.writeResponse(this.getUsageMessage(), 'STDERR');
      throw new Error(`Remote path is empty (remote=${remotePath})`);
    }

    if (!path.isAbsolute(remotePath)) {
      remotePath = path.join(cwd, remotePath);
    }

    if (!localPath || !localPath.trim()) {
      localPath = path.basename(remotePath);
    }

    if (!path.isAbsolute(localPath)) {
      localPath = path.join(process.cwd(), localPath);
    }

    // @future - pass environments to context (SSH_CONNECTION, TIMEZONE)
    await context.writeResponse(
      `Downloading ${remotePath} from to ${localPath}\n`,
      'STDOUT',
    );

    const sftp = context.getSshClient().sftp();
    await sftp.fastGet(remotePath, localPath);
    await context.writeResponse(
      'File is downloaded successfully\n',
      'STDOUT',
      0,
    );
  }

  /**
   * Returns command usage message.
   */
  public getUsageMessage(): string {
    return 'get REMOTE_PATH [LOCAL_PATH]\n';
  }
}
