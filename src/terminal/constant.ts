// Copyright (c) 2019-present, Anton Makarov <zer0c14@gmail.com>
// See the LICENSE for more information.

import path from 'path';

/**
 * Inversion control types.
 */
export const TYPES = {
  Logger: Symbol.for('Terminal/Logger'),
  ConnectionActionParser: Symbol.for('Terminal/ConnectionActionParser'),

  SshClientClass: Symbol.for('Terminal/SshClientClass'),
  SshClientFactory: Symbol.for('Terminal/SshClientFactory'),

  TerminalService: Symbol.for('Terminal/TerminalService'),
  TerminalAction: Symbol.for('Terminal/TerminalAction'),

  ConsumerCommandParser: Symbol.for('Terminal/ConsumerCommandParser'),
  ConsumerCommandDispatcher: Symbol.for('Terminal/ConsumerCommandDispatcher'),
  ConsumerCommandContextFactory: Symbol.for(
    'Terminal/ConsumerCommandContextFactory',
  ),
  ConsumerCommandContextClass: Symbol.for(
    'Terminal/ConsumerCommandContextClass',
  ),

  CopyScriptRunner: Symbol.for('Terminal/CopyScriptRunner'),
  TerminalShellRunner: Symbol.for('Terminal/TerminalShellRunner'),
  CommandConsumerRunner: Symbol.for('Terminal/CommandConsumerRunner'),

  GetCommandHandler: Symbol.for('Terminal/GetCommandHandler'),
  PutCommandHandler: Symbol.for('Terminal/PutCommandHandler'),
};

/**
 * Application path.
 */
const APP_PATH = path.dirname(path.dirname(__dirname));

/**
 * Copy runner scripts (initialize skeleton).
 */
export const COPY_RUNNER_SCRIPTS: Array<[string, string]> = [
  [`${APP_PATH}/scripts/bin/get.sh`, 'bin/get'],
  [`${APP_PATH}/scripts/bin/put.sh`, 'bin/put'],
  [`${APP_PATH}/scripts/_consumer.sh`, '_consumer.sh'],
  [`${APP_PATH}/scripts/_producer.sh`, '_producer.sh'],
];
