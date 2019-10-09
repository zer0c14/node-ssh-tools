// Copyright (c) 2019-present, Anton Makarov <zer0c14@gmail.com>
// See the LICENSE for more information.

import createLogger from 'pino';
import { Container, ContainerModule, interfaces } from 'inversify';
import { Client as SshClient } from 'ssh2';
import { ConnectionActionParser } from '../terminal';
import { TYPES } from './constant';
import { TunnelService } from './service';
import { SshClientHelper } from './helper';
import {
  LocalTunnelServer,
  RemoteTunnelServer,
  TunnelShellServer,
} from './server';

import {
  LocalTunnelAction,
  RemoteTunnelAction,
  TunnelRuleActionParser,
} from './action';

import {
  SshClientFactory,
  SshServerFactory,
  LocalTunnelServerFactory,
  RemoteTunnelServerFactory,
} from './factory';

/**
 * Container module.
 */
export const containerModule = new ContainerModule((bind: interfaces.Bind) => {
  /**
   * Binds utility tools.
   */
  bind(TYPES.Logger).toConstantValue(createLogger());

  /**
   * Binds action parsers.
   */
  bind(TYPES.TunnelRuleActionParser)
    .to(TunnelRuleActionParser)
    .inSingletonScope();

  bind(TYPES.ConnectionActionParser)
    .to(ConnectionActionParser)
    .inSingletonScope();

  /**
   * Binds actions.
   */
  bind(TYPES.LocalTunnelAction)
    .to(LocalTunnelAction)
    .inSingletonScope();

  bind(TYPES.RemoteTunnelAction)
    .to(RemoteTunnelAction)
    .inSingletonScope();

  /**
   * Binds services.
   */
  bind(TYPES.TunnelService)
    .to(TunnelService)
    .inSingletonScope();

  /**
   * Binds servers.
   */
  bind(TYPES.LocalTunnelServerClass).toConstructor(LocalTunnelServer);
  bind(TYPES.LocalTunnelServerFactory)
    .to(LocalTunnelServerFactory)
    .inSingletonScope();

  bind(TYPES.RemoteTunnelServerClass).toConstructor(RemoteTunnelServer);
  bind(TYPES.RemoteTunnelServerFactory)
    .to(RemoteTunnelServerFactory)
    .inSingletonScope();

  /**
   * Binds ssh factories.
   */
  bind(TYPES.SshClientClass).toConstructor(SshClient);
  bind(TYPES.SshClientHelper).toConstantValue(SshClientHelper);
  bind(TYPES.SshClientFactory)
    .to(SshClientFactory)
    .inSingletonScope();

  bind(TYPES.SshServerClass).toConstructor(TunnelShellServer);
  bind(TYPES.SshServerFactory)
    .to(SshServerFactory)
    .inSingletonScope();
});

/**
 * Creates container.
 */
export const createContainer = (): Container => {
  const container = new Container();
  container.load(containerModule);

  return container;
};
