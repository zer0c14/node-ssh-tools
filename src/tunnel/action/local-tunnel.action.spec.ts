// Copyright (c) 2019-present, Anton Makarov <zer0c14@gmail.com>
// See the LICENSE for more information.

import { expect } from 'chai';
import createLogger from 'pino';
import { it, describe } from 'mocha';
import { TYPES } from '../constant';
import { createContainer } from '../container';
import { LocalTunnelAction } from './local-tunnel.action';

describe('tunnel.action', () => {
  describe('#LocalTunnelAction', () => {
    /**
     * Local tunnel action handle action.
     */
    describe('#LocalTunnelAction::handleAction', () => {
      let container = createContainer();
      const tunnelRuleString = '192.168.1.1:8000:127.0.0.1:80';
      const connectionString = 'username:password@localhost:22';

      beforeEach(() => {
        container
          .rebind(TYPES.Logger)
          .toConstantValue(createLogger({ enabled: false }));
      });

      afterEach(() => {
        container = createContainer();
      });

      it('should return void if service throw error', () => {
        container.rebind(TYPES.TunnelService).toConstantValue({
          runLocalTunnel: () => Promise.reject(new Error()),
        });

        const tunnelAction = container.get<LocalTunnelAction>(
          TYPES.LocalTunnelAction,
        );

        expect(tunnelAction.handleAction(connectionString, tunnelRuleString)).to
          .be.undefined;
      });

      it('should throw error if options is incorrect', () => {
        const tunnelAction = container.get<LocalTunnelAction>(
          TYPES.LocalTunnelAction,
        );

        expect(() =>
          tunnelAction.handleAction(connectionString, ''),
        ).to.throw();

        expect(() =>
          tunnelAction.handleAction('', tunnelRuleString),
        ).to.throw();
      });

      it('should return void if parameters is valid', () => {
        container
          .rebind(TYPES.TunnelService)
          .toConstantValue({ runLocalTunnel: () => Promise.resolve(null) });

        const tunnelAction = container.get<LocalTunnelAction>(
          TYPES.LocalTunnelAction,
        );

        expect(tunnelAction.handleAction(connectionString, tunnelRuleString)).to
          .be.undefined;
      });
    });
  });
});
