// Copyright (c) 2019-present, Anton Makarov <zer0c14@gmail.com>
// See the LICENSE for more information.

import bootstrap from './bootstrap';

export {
  ITerminalAction,
  TerminalAction,
  IConnectionActionParser,
  IConnectionActionParserResult,
  ConnectionActionParser,
  GetCommandHandler,
  PutCommandHandler,
  IConsumerCommandContext,
  ConsumerCommandContext,
  IConsumerCommandHandler,
  IConsumerCommandDispatcher,
  IConsumerCommandDispatcherOptions,
  ConsumerCommandDispatcher,
  IConsumerCommandParser,
  ConsumerCommandParser,
  ISshClientFactory as ITerminalSshClientFactory,
  ISshClientFactoryOptions as ITerminalSshClientFactoryOptions,
  SshClientFactory as TerminalSshClientFactory,
  IConsumerCommandContextFactory,
  ConsumerCommandContextFactory,
  ICommandConsumerRunner,
  CommandConsumerRunner,
  ITerminalShellRunner,
  ITerminalShellRunnerRunOptions,
  TerminalShellRunner,
  ITerminalService,
  TerminalService,
  ITerminalServiceRunTerminalOptions,
} from './terminal';

export {
  TunnelService,
  IRemoteTunnelAction,
  RemoteTunnelAction,
  ITunnelRuleActionParser,
  ITunnelRuleActionParserResult,
  TunnelRuleActionParser,
  ITunnelService,
  ITunnelShellServerOptions,
  TunnelShellServer,
  IRemoteTunnelServerOptions,
  IRunRemoteTunnelOptions,
  RemoteTunnelServer,
  IRemoteTunnelServerFactory,
  RemoteTunnelServerFactory,
  IBaseShellServerOptions,
  BaseShellServer,
  ISshClientHelper,
  SshClientHelper,
  BaselShellClient,
  IRemoteTunnelServer,
  IShellClientRequestContext,
  LocalTunnelServerFactory,
  IRemoteTunnelServerFactoryOptions,
  LocalTunnelServer,
  LocalTunnelAction,
  ILocalTunnelServer,
  ISshServerFactory,
  SshServerFactory,
  ISshServerFactoryOptions,
  IRunLocalTunnelOptions,
  ILocalTunnelAction,
  ILocalTunnelServerOptions,
  ILocalTunnelServerFactory,
  ILocalTunnelServerFactoryOptions,
  SshClientFactory as TunnelSshClientFactory,
  ISshClientFactory as ITunnelSshClientFactory,
} from './tunnel';

/**
 * CLI entry point.
 */
if (!module.parent) {
  bootstrap(process.argv);
}
