// Copyright (c) 2019-present, Anton Makarov <zer0c14@gmail.com>
// See the LICENSE for more information.

import { Client as SshClient } from 'ssh2';
import { inject, injectable, interfaces } from 'inversify';
import { TYPES } from '../constant';

/**
 * Ssh client factory interface.
 */
export interface ISshClientFactory {
  createClient(): SshClient;
}

/**
 * Ssh client factory.
 */
@injectable()
export class SshClientFactory implements ISshClientFactory {
  /**
   * Client constructor.
   */
  @inject(TYPES.SshClientClass)
  protected clientClass: interfaces.Newable<SshClient>;

  /**
   * Creates client instance.
   */
  public createClient(): SshClient {
    return new this.clientClass();
  }
}
