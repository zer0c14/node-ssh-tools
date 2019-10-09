// Copyright (c) 2019-present, Anton Makarov <zer0c14@gmail.com>
// See the LICENSE for more information.

import createLogger from 'pino';
import { Container, ContainerModule, interfaces } from 'inversify';
import SshClient from 'ssh2-promise';
import { TYPES, COPY_RUNNER_SCRIPTS } from './constant';
import { ConnectionActionParser, TerminalAction } from './action';
import { TerminalService } from './service';
import { ConsumerCommandContextFactory, SshClientFactory } from './factory';
import { GetCommandHandler, PutCommandHandler } from './command';
import {
  ConsumerCommandContext,
  ConsumerCommandDispatcher,
  ConsumerCommandParser,
} from './consumer';
import {
  CommandConsumerRunner,
  CopyScriptRunner,
  TerminalShellRunner,
} from './runner';

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
  bind(TYPES.ConnectionActionParser)
    .to(ConnectionActionParser)
    .inSingletonScope();

  /**
   * Binds actions.
   */
  bind(TYPES.TerminalAction)
    .to(TerminalAction)
    .inSingletonScope();

  /**
   * Binds services.
   */
  bind(TYPES.TerminalService)
    .to(TerminalService)
    .inSingletonScope();

  /**
   * Binds consumer classes.
   */
  bind(TYPES.GetCommandHandler)
    .to(GetCommandHandler)
    .inSingletonScope();

  bind(TYPES.PutCommandHandler)
    .to(PutCommandHandler)
    .inSingletonScope();

  bind(TYPES.ConsumerCommandParser)
    .to(ConsumerCommandParser)
    .inSingletonScope();

  bind(TYPES.ConsumerCommandDispatcher)
    .toDynamicValue(
      ({ container }: interfaces.Context) =>
        new ConsumerCommandDispatcher({
          handlers: {
            get: container.get(TYPES.GetCommandHandler),
            put: container.get(TYPES.PutCommandHandler),
          },
        }),
    )
    .inSingletonScope();

  bind(TYPES.ConsumerCommandContextClass).toConstructor(ConsumerCommandContext);
  bind(TYPES.ConsumerCommandContextFactory)
    .to(ConsumerCommandContextFactory)
    .inSingletonScope();

  /**
   * Binds runners.
   */
  bind(TYPES.CopyScriptRunner)
    .toDynamicValue(
      () => new CopyScriptRunner({ scripts: COPY_RUNNER_SCRIPTS }),
    )
    .inSingletonScope();

  bind(TYPES.CommandConsumerRunner)
    .to(CommandConsumerRunner)
    .inSingletonScope();

  bind(TYPES.TerminalShellRunner)
    .to(TerminalShellRunner)
    .inSingletonScope();

  /**
   * Binds ssh factories.
   */
  bind(TYPES.SshClientClass).toConstructor(SshClient);
  bind(TYPES.SshClientFactory)
    .to(SshClientFactory)
    .inSingletonScope();
});

/**
 * Creates container.
 */
export const createContainer = () => {
  const container = new Container();
  container.load(containerModule);

  return container;
};
