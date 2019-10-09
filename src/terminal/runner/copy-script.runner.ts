// Copyright (c) 2019-present, Anton Makarov <zer0c14@gmail.com>
// See the LICENSE for more information.

import SshClient from 'ssh2-promise';
import path from "path";

/**
 * Copy script runner interface.
 */
export interface ICopyScriptRunner {
  run(sshClient: SshClient, directory: string): Promise<void>;
}

/**
 * Copy script runner options.
 */
export interface ICopyScriptRunnerOptions {
  scripts?: Array<[string, string]>;
}

/**
 * Copy script runner.
 */
export class CopyScriptRunner implements ICopyScriptRunner {
  /**
   * Scripts.
   */
  protected scripts: Array<[string, string]> = [];

  /**
   * Constructor.
   *
   * @param options
   */
  public constructor(options: ICopyScriptRunnerOptions) {
    this.scripts = options.scripts || [];
  }

  /**
   * Runs copy script runner.
   *
   * @param sshClient
   * @param remoteDirectory
   */
  async run(sshClient: SshClient, remoteDirectory: string): Promise<void> {
    await sshClient.exec(`rm -rf ${remoteDirectory}`);
    await sshClient.exec(`mkdir -p ${remoteDirectory}`);

    const remoteDirectories = new Set();
    await Promise.all(
      this.scripts.map(([localPath, remotePath]) => {
        const filename = path.isAbsolute(remotePath)
          ? remotePath
          : path.join(remoteDirectory, remotePath);

        const sftp = sshClient.sftp();
        const directory = path.dirname(filename);
        if (!remoteDirectories.has(directory)) {
          return sshClient
            .exec(`mkdir -p ${directory}`)
            .then(() => remoteDirectories.add(directory))
            .then(() =>
              sftp.fastPut(localPath, filename, { mode: 0o740 }),
            );
        }

        return sftp.fastPut(localPath, filename, { mode: 0o740 });
      }),
    );
  }
}
