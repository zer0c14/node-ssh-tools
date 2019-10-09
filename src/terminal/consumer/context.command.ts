// Copyright (c) 2019-present, Anton Makarov <zer0c14@gmail.com>
// See the LICENSE for more information.

import path from 'path';
import { Writable as WritableStream } from 'stream';
import SshClient from 'ssh2-promise';

/**
 * Standard stream type.
 */
type StdType = 'STDIN' | 'STDOUT' | 'STDERR';

/**
 * Command context interface.
 */
export interface IConsumerCommandContext {
  getSshClient(): SshClient;
  getCommandQueue(): string;
  writeResponse(
    buffer: Buffer | string,
    stdType?: StdType,
    exitCode?: number,
  ): Promise<IConsumerCommandContext>;
  endCommand(exitCode?: number): Promise<IConsumerCommandContext>;
}

/**
 * Standard command context.
 */
export class ConsumerCommandContext implements IConsumerCommandContext {
  /**
   * Constructor.
   *
   * @param sshClient
   * @param commandQueue
   */
  constructor(protected sshClient: SshClient, protected commandQueue: string) {}

  /**
   * Writes buffer to process standard stream.
   *
   * @param response
   * @param stdType
   * @param exitCode
   */
  public async writeResponse(
    response: Buffer | string,
    stdType: StdType = 'STDOUT',
    exitCode: number = null,
  ): Promise<ConsumerCommandContext> {
    const buffer = Buffer.from(response as string);
    const filename = await this.createTemporaryStdFile(stdType);

    if (buffer.length) {
      await this.writeBufferToRemoteFile(buffer, filename);
      await this.sshClient.exec(
        `echo "${stdType}:${filename}" >> ${this.commandQueue}`,
      );
    }

    if (exitCode !== null) {
      await this.endCommand(exitCode);
    }

    return this;
  }

  /**
   * Writes buffer to remote file.
   *
   * @param buffer
   * @param filename
   */
  protected writeBufferToRemoteFile(
    buffer: Buffer,
    filename: string,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      this.sshClient
        .sftp()
        .createWriteStream(filename)
        .then((stream: WritableStream) => {
          stream.end(buffer);
          stream.on('error', reject);
          stream.on('finish', () => resolve());
        })
        .catch(reject);
    });
  }

  /**
   * End running command with some exit code.
   *
   * @param exitCode
   */
  public async endCommand(
    exitCode: number = 0,
  ): Promise<ConsumerCommandContext> {
    await this.sshClient.exec(
      `echo "EXIT:${exitCode}" >> ${this.commandQueue}`,
    );

    return this;
  }

  /**
   * Creates temporary standard stream file.
   *
   * @param stdType
   */
  protected async createTemporaryStdFile(stdType: string): Promise<string> {
    const suffix = stdType.toLowerCase();
    const directory = path.dirname(this.commandQueue);

    const filename: string = await this.sshClient.exec(
      `mktemp -p "${directory}" -t cmd.XXXXXXXXXX --suffix=.${suffix}`,
    );

    return filename.trim();
  }

  /**
   * Returns ssh client.
   */
  public getSshClient(): SshClient {
    return this.sshClient;
  }

  /**
   * Returns command queue.
   */
  public getCommandQueue(): string {
    return this.commandQueue;
  }
}
