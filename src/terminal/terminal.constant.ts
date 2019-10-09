// Copyright (c) 2019-present, Anton Makarov <zer0c14@gmail.com>
// See the LICENSE for more information.

/**
 * Inversion control types.
 */
export const TYPES = {
  Logger: Symbol.for('Terminal\\Logger'),
  TerminalShell: Symbol.for('Terminal\\TerminalShell'),
  TerminalAction: Symbol.for('Terminal\\TerminalAction'),
  TerminalService: Symbol.for('Terminal\\TerminalService'),
  CommandConsumer: Symbol.for('Terminal\\CommandConsumer'),
  SshClientFactory: Symbol.for('Terminal\\SshClientFactory'),
  ConsumerCommandDispatcher: Symbol.for('Terminal\\ConsumerCommandDispatcher'),
  ConsumerCommandParser: Symbol.for('Terminal\\ConsumerCommandParser'),
  ConnectionStringParser: Symbol.for('Terminal\\ConnectionStringParser'),
  ConsumerCommandContextFactory: Symbol.for('Terminal\\ConsumerCommandContextFactory'),
  GetCommandHandler: Symbol.for('Terminal\\GetCommandHandler'),
  PutCommandHandler: Symbol.for('Terminal\\PutCommandHandler'),
};
