// Copyright (c) 2019-present, Anton Makarov <zer0c14@gmail.com>
// See the LICENSE for more information.

import { inject, injectable, interfaces } from 'inversify';
import SshClient from 'ssh2-promise';
import { TYPES } from '../constant';
import { IConsumerCommandContext } from '../consumer';

/**
 * Consumer command context factory interface.
 */
export interface IConsumerCommandContextFactory {
  createContext(
    sshClient: SshClient,
    consumerCommand: string,
  ): IConsumerCommandContext;
}

/**
 * Consumer command context factory.
 */
@injectable()
export class ConsumerCommandContextFactory
  implements IConsumerCommandContextFactory {
  /**
   * Context constructor.
   */
  @inject(TYPES.ConsumerCommandContextClass)
  protected contextClass: interfaces.Newable<IConsumerCommandContext>;

  /**
   * Creates context instance.
   *
   * @param sshClient
   * @param consumerCommand
   */
  public createContext(sshClient: SshClient, consumerCommand: string) {
    return new this.contextClass(sshClient, consumerCommand);
  }
}
