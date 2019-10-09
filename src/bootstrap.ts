// Copyright (c) 2019-present, Anton Makarov <zer0c14@gmail.com>
// See the LICENSE for more information.

import commander from 'commander';
import container from './container';
import { ITerminalAction, TYPES as TERMINAL_TYPES } from './terminal';
import {
  ILocalTunnelAction,
  IRemoteTunnelAction,
  TYPES as TUNNEL_TYPES,
} from './tunnel';

/**
 * Bootstrap function.
 *
 * @param argv
 */
export default (argv: string[] = process.argv) => {
  commander
    .version('1.0.0')
    .command('local-tunnel <connection-string> <tunnel-rule>')
    .description('run local port tunnel to server')
    .action((connectionString, tunnelRule) =>
      container
        .get<ILocalTunnelAction>(TUNNEL_TYPES.LocalTunnelAction)
        .handleAction(connectionString, tunnelRule),
    );

  commander
    .version('1.0.0')
    .command('remote-tunnel <connection-string> <tunnel-rule>')
    .description('run remote tunnel to server')
    .action((connectionString, tunnelRule) =>
      container
        .get<IRemoteTunnelAction>(TUNNEL_TYPES.RemoteTunnelAction)
        .handleAction(connectionString, tunnelRule),
    );

  commander
    .version('1.0.0')
    .command('terminal <connection-string>')
    .description('run remote terminal to server')
    .action(connectionString =>
      container
        .get<ITerminalAction>(TERMINAL_TYPES.TerminalAction)
        .handleAction(connectionString),
    );

  commander.parse(argv);

  if (!commander.args.length) {
    commander.help();
  }
};
