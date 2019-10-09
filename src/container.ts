// Copyright (c) 2019-present, Anton Makarov <zer0c14@gmail.com>
// See the LICENSE for more information.

import 'reflect-metadata';
import net from 'net';
import ssh2 from 'ssh2';
import SshClient from 'ssh2-promise';
import createLogger from 'pino';
import { Container, interfaces } from 'inversify';

import {
  TYPES as TUNNEL_TYPES,
  TunnelRuleParser,
  TunnelAction,
  TunnelService,
  SshClientHelper,
} from './tunnel';

import {
  TYPES as TERMINAL_TYPES,
  TerminalAction,
  TerminalService,
  CommandConsumer,
  ConsumerCommandDispatcher,
  ConsumerCommandContext,
  ConsumerCommandParser,
  GetCommandHandler,
  PutCommandHandler,
  TerminalShell,
  ConnectionStringParser,
} from './terminal';

/**
 * Container.
 *
 * @future - add container modules and rewrite to dynamic value
 * @future - add other container for unit testing (fixtures)
 */
export const container = new Container();

/**
 * Terminal binding.
 */
container.bind(TERMINAL_TYPES.Logger).toConstantValue(createLogger());
container.bind(TERMINAL_TYPES.TerminalShell).to(TerminalShell);
container.bind(TERMINAL_TYPES.TerminalAction).to(TerminalAction);
container.bind(TERMINAL_TYPES.TerminalService).to(TerminalService);
container.bind(TERMINAL_TYPES.CommandConsumer).to(CommandConsumer);
container.bind(TERMINAL_TYPES.ConsumerCommandParser).to(ConsumerCommandParser);
container
  .bind(TERMINAL_TYPES.ConsumerCommandContextFactory)
  .toConstantValue(
    (client, command) => new ConsumerCommandContext(client, command),
  );

/**
 * Creates dispatcher and command handlers.
 */
container.bind(TERMINAL_TYPES.GetCommandHandler).to(GetCommandHandler);
container.bind(TERMINAL_TYPES.PutCommandHandler).to(PutCommandHandler);
container
  .bind(TERMINAL_TYPES.ConsumerCommandDispatcher)
  .toDynamicValue(
    ({ container }: interfaces.Context) =>
      new ConsumerCommandDispatcher({
        handlers: {
          get: container.get(TERMINAL_TYPES.GetCommandHandler),
          put: container.get(TERMINAL_TYPES.PutCommandHandler),
        },
      }),
  )
  .inSingletonScope();

/**
 * Creates a ssh client for for each session.
 */
container
  .bind(TERMINAL_TYPES.SshClientFactory)
  .toConstantValue(options => new SshClient(options));

/**
 * Connection string parser alias.
 */
container
  .bind(TERMINAL_TYPES.ConnectionStringParser)
  .to(ConnectionStringParser);

/**
 * Tunnel binding.
 */
container.bind(TUNNEL_TYPES.Logger).toConstantValue(createLogger());
container.bind(TUNNEL_TYPES.TunnelRuleParser).to(TunnelRuleParser);
container.bind(TUNNEL_TYPES.TunnelAction).to(TunnelAction);
container.bind(TUNNEL_TYPES.TunnelService).to(TunnelService);
container.bind(TUNNEL_TYPES.SshClientHelper).toConstantValue(SshClientHelper);
container.bind(TUNNEL_TYPES.TcpServerFactory).toConstantValue(net.createServer);
container
  .bind(TUNNEL_TYPES.SshClientFactory)
  .toConstantValue(() => new ssh2.Client());
container
  .bind(TUNNEL_TYPES.SshServerFactory)
  .toConstantValue(options => new ssh2.Server(options));

/**
 * Connection string parser.
 */
container.bind(TUNNEL_TYPES.ConnectionStringParser).to(ConnectionStringParser);

/**
 * Export container.
 */
export default container;
