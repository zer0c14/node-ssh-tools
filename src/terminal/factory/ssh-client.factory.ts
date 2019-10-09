// Copyright (c) 2019-present, Anton Makarov <zer0c14@gmail.com>
// See the LICENSE for more information.

import { inject, injectable, interfaces } from 'inversify';
import { ConnectConfig } from 'ssh2';
import SshClient from 'ssh2-promise';
import { TYPES } from '../constant';

/**
 * Ssh client factory options interface.
 */
export type ISshClientFactoryOptions = ConnectConfig;

/**
 * Ssh client factory interface.
 */
export interface ISshClientFactory {
  createClient(options: ISshClientFactoryOptions): SshClient;
}

@injectable()
export class SshClientFactory implements ISshClientFactory {
  /**
   * Client constructor.
   */
  @inject(TYPES.SshClientClass)
  protected clientClass: interfaces.Newable<SshClient>;

  /**
   * Creates client instance.
   *
   * @param options
   */
  public createClient(options: ISshClientFactoryOptions): SshClient {
    return new SshClient(options);
  }
}
