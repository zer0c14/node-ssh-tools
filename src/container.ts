// Copyright (c) 2019-present, Anton Makarov <zer0c14@gmail.com>
// See the LICENSE for more information.

import 'reflect-metadata';
import { Container } from 'inversify';
import { containerModule as tunnelModule } from './tunnel';
import { containerModule as terminalModule } from './terminal';

/**
 * Container.
 *
 * @future - add other unit test container (fixtures)
 */
export const container = new Container();

/**
 * Loads container modules.
 */
container.load(terminalModule, tunnelModule);

/**
 * Export container.
 */
export default container;
