// Copyright (c) 2019-present, Anton Makarov <zer0c14@gmail.com>
// See the LICENSE for more information.

import bootstrap from './bootstrap';

export { IConnectionStringParser, parseConnectionString } from './common';

export {
  TerminalAction,
  TerminalService,
  PutCommandHandler,
  GetCommandHandler,
  ConsumerCommandDispatcher,
  IConsumerCommandContext,
  ConsumerCommandContext,
  IConsumerCommandHandler,
  ConsumerCommandParser,
  IConsumerCommandParser,
  IConsumerCommandDispatcherOptions,
  IConsumerCommandContextFactory,
  IConsumerCommandDispatcher,
  CommandConsumer,
  ITerminalAction,
  ITerminalService,
  ISshClientFactory,
  ITerminalServiceRunTerminalOptions,
  ICommandConsumer,
  ICommandConsumerOptions,
  TerminalShell,
  ITerminalShellRunOptions,
  ITerminalShell,
} from './terminal';

export {
  SshClientHelper,
  TunnelService,
  TunnelAction,
  TunnelRuleParser,
  ISshClientHelper,
  ITunnelRuleParser,
  ITunnelRule,
  ITunnelAction,
  ITunnelService,
  ITunnelServiceSshServerFactory,
  IRunRemoteTunnelOptions,
  ITunnelServiceTcpServerFactory,
  ITunnelServiceSshClientFactory,
  IRunLocalTunnelOptions,
} from './tunnel';

/**
 * CLI entry point.
 */
if (!module.parent) {
  bootstrap(process.argv);
}
