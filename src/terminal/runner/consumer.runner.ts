// Copyright (c) 2019-present, Anton Makarov <zer0c14@gmail.com>
// See the LICENSE for more information.

import { Logger } from 'pino';
import { injectable, inject } from 'inversify';
import split2 from 'split2';
import SshClient from 'ssh2-promise';
import { ClientChannel } from 'ssh2';
import { TYPES } from '../constant';
import { IConsumerCommandContextFactory } from '../factory';
import {
  IConsumerCommandDispatcher,
  IConsumerCommandParser,
} from '../consumer';

/**
 * Command consumer interface.
 */
export interface ICommandConsumerRunner {
  run(
    sshClient: SshClient,
    consumerCommand: string,
    commandPosition?: number,
  ): Promise<ClientChannel>;
}

/**
 * Command consumer.
 */
@injectable()
export class CommandConsumerRunner implements ICommandConsumerRunner {
  /**
   * Logger.
   */
  @inject(TYPES.Logger)
  protected logger: Logger;

  /**
   * Command dispatcher.
   */
  @inject(TYPES.ConsumerCommandDispatcher)
  protected dispatcher: IConsumerCommandDispatcher;

  /**
   * Command parser.
   */
  @inject(TYPES.ConsumerCommandParser)
  protected commandParser: IConsumerCommandParser;

  /**
   * Command context factory.
   */
  @inject(TYPES.ConsumerCommandContextFactory)
  protected contextFactory: IConsumerCommandContextFactory;

  /**
   * Runs command consumer.
   *
   * @param sshClient
   * @param consumerCommand
   * @param commandPosition
   */
  public async run(
    sshClient: SshClient,
    consumerCommand: string,
    commandPosition: number = 0,
  ): Promise<ClientChannel> {
    const splitStream = split2();
    const stream: ClientChannel = await sshClient.spawn(consumerCommand);

    let commandCounter = 0;
    stream.pipe(splitStream).on('data', data => {
      const [queue, cwd, ...argv] = this.commandParser.parse(data);
      const context = this.contextFactory.createContext(sshClient, queue);

      // @future - add concurrent executor (e.g. async.queue)
      // @future - add counter and restart consumer (stream.close + commandCounter)
      splitStream.pause();
      this.dispatcher
        .dispatch(argv, cwd, context)
        .catch(error =>
          context
            .writeResponse(`${error}\n`, 'STDERR', 1)
            .then(() => this.logger.error(error))
            .catch(error => this.logger.error(error)),
        )
        .finally(() => splitStream.resume());

      ++commandCounter;
    });
    stream.on('close', () => sshClient.close());

    return stream;
  }
}
