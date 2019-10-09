// Copyright (c) 2019-present, Anton Makarov <zer0c14@gmail.com>
// See the LICENSE for more information.

import path from 'path';
import { injectable } from 'inversify';
import { IConsumerCommandContext, IConsumerCommandHandler } from '..';

/**
 * Put command handler.
 *
 * @future - copy/paste get command handler (add reuse methods)
 */
@injectable()
export class PutCommandHandler implements IConsumerCommandHandler {
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
    let [, localPath, remotePath] = argv;
    if (!localPath || !localPath.trim()) {
      await context.writeResponse(this.getUsageMessage(), 'STDERR');
      throw new Error(`Local path is empty (remote=${localPath})`);
    }

    if (!path.isAbsolute(localPath)) {
      localPath = path.join(process.cwd(), localPath);
    }

    if (!remotePath || !remotePath.trim()) {
      remotePath = path.basename(localPath);
    }

    if (!path.isAbsolute(remotePath)) {
      remotePath = path.join(cwd, remotePath);
    }

    // @future - pass environments to context (SSH_CONNECTION, TIMEZONE)
    await context.writeResponse(
      `Uploading ${localPath} from to ${remotePath}\n`,
      'STDOUT',
    );

    const sftp = context.getSshClient().sftp();
    await sftp.fastPut(localPath, remotePath);
    await context.writeResponse('File is uploaded successfully\n', 'STDOUT', 0);
  }

  /**
   * Returns command usage message.
   */
  public getUsageMessage(): string {
    return 'put LOCAL_PATH [REMOTE_PATH]\n';
  }
}
