// Copyright (c) 2019-present, Anton Makarov <zer0c14@gmail.com>
// See the LICENSE for more information.

import commander from 'commander';
import container from './container';
import { ITunnelAction, TYPES as TUNNEL_TYPES } from './tunnel';
import { ITerminalAction, TYPES as TERMINAL_TYPES } from './terminal';

/**
 * Bootstrap function.
 *
 * @param argv
 */
export default (argv: string[] = process.argv) => {
  const tunnelAction = container.get<ITunnelAction>(TUNNEL_TYPES.TunnelAction);
  const terminalAction = container.get<ITerminalAction>(
    TERMINAL_TYPES.TerminalAction,
  );

  commander
    .version('1.0.0')
    .command('local-tunnel <connection-string> <tunnel-rule>')
    .description('run local port tunnel to server')
    .action((connectionString, tunnelRule) =>
      tunnelAction.handleAction(connectionString, tunnelRule),
    );

  commander
    .version('1.0.0')
    .command('terminal <connection-string>')
    .description('run remote terminal to server')
    .action(connectionString => terminalAction.handleAction(connectionString));

  commander.parse(argv);

  if (!commander.args.length) {
    commander.help();
  }
};
