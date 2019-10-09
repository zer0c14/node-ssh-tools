// Copyright (c) 2019-present, Anton Makarov <zer0c14@gmail.com>
// See the LICENSE for more information.

import path from 'path';
import { ReadStream, WriteStream } from 'tty';
import uuid from 'uuid';
import { injectable, inject } from 'inversify';
import { Logger } from 'pino';
import { ConnectConfig } from 'ssh2';
import SshClient from 'ssh2-promise';
import { TYPES } from '../constant';
import { ISshClientFactory } from '../factory';
import {
  ITerminalShellRunner,
  ICommandConsumerRunner,
  ICopyScriptRunner,
} from '../runner';

/**
 * Run terminal options interface.
 */
export interface ITerminalServiceRunTerminalOptions extends ConnectConfig {
  stdin: ReadStream;
  stdout: WriteStream;
  stderr: WriteStream;
}

/**
 * Terminal service interface.
 */
export interface ITerminalService {
  runTerminal(options: ITerminalServiceRunTerminalOptions): Promise<SshClient>;
}

/**
 * Terminal service.
 */
@injectable()
export class TerminalService implements ITerminalService {
  /**
   * Logger.
   */
  @inject(TYPES.Logger)
  protected logger: Logger;

  @inject(TYPES.CopyScriptRunner)
  protected copyScriptRunner: ICopyScriptRunner;

  /**
   * Command consumer.
   */
  @inject(TYPES.CommandConsumerRunner)
  protected commandConsumer: ICommandConsumerRunner;

  /**
   * Terminal shell.
   */
  @inject(TYPES.TerminalShellRunner)
  protected terminalShell: ITerminalShellRunner;

  /**
   * Ssh client factory.
   */
  @inject(TYPES.SshClientFactory)
  protected sshClientFactory: ISshClientFactory;

  /**
   * Runs terminal.
   *
   * @param options
   */
  public async runTerminal(
    options: ITerminalServiceRunTerminalOptions,
  ): Promise<SshClient> {
    const sshClient = this.sshClientFactory.createClient(options);

    await sshClient.connect();
    this.logger.info(`Connection successful (host=${options.host})`);

    const environments = await this.getRemoteEnvironments(sshClient);
    const sessionId = environments['XDG_SESSION_ID'] || uuid.v4();
    const sessionDirectory = this.generateSessionDirectory(
      sessionId,
      environments['TMPDIR'],
    );

    this.logger.info(`Copy scripts to server (host=${options.host})`);
    await this.copyScriptRunner.run(sshClient, sessionDirectory);

    this.logger.info(`Run interactive shell (host=${options.host})`);
    const consumerCommand = `${sessionDirectory}/_consumer.sh`;
    await this.commandConsumer.run(sshClient, consumerCommand);

    const shellEnvironments = { PATH: `${sessionDirectory}/bin:$PATH` };
    if (!environments['XDG_SESSION_ID']) {
      shellEnvironments['SSH_TOOLS_SESSION_ID'] = sessionId;
    }

    const shellOptions = { ...options, environments: shellEnvironments };
    await this.terminalShell.run(sshClient, shellOptions);

    return sshClient;
  }

  /**
   * Returns remote environments.
   *
   * @param sshClient
   */
  protected async getRemoteEnvironments(sshClient: SshClient): Promise<{}> {
    const environments = {};
    ((await sshClient.exec('env')) as string)
      .trim()
      .split('\n')
      .forEach(line => {
        const [name, value] = line.trim().split('=', 2);
        environments[name] = value;
      });

    return environments;
  }

  /**
   * Returns session directory.
   *
   * @param sessionId
   * @param directory
   */
  protected generateSessionDirectory(
    sessionId: string,
    directory: string = '/tmp',
  ): string {
    return path.join(directory, '@zer0c14/ssh-tools', sessionId);
  }
}
