// Copyright (c) 2019-present, Anton Makarov <zer0c14@gmail.com>
// See the LICENSE for more information.

import { expect } from 'chai';
import createLogger from 'pino';
import { it, describe } from 'mocha';
import container from '../container';
import { TYPES } from './tunnel.constant';
import { TunnelAction } from './tunnel.action';
import { TunnelService } from './tunnel.service';

describe('tunnel.action', () => {
  describe('#TunnelAction', () => {
    /**
     * Tunnel action handle action.
     */
    describe('#TunnelAction::handleAction', () => {
      const tunnelRuleString = '192.168.1.1:8000:127.0.0.1:80';
      const connectionString = 'username:password@localhost:22';

      beforeEach(() => {
        container
          .rebind(TYPES.Logger)
          .toConstantValue(createLogger({ enabled: false }));
      });

      it('should return void if service throw error', () => {
        container.rebind(TYPES.TunnelService).toConstantValue({
          runLocalTunnel: () => Promise.reject(new Error()),
        });

        const tunnelAction = container.get<TunnelAction>(TYPES.TunnelAction);
        expect(tunnelAction.handleAction(connectionString, tunnelRuleString)).to
          .be.undefined;
      });

      it('should return void if options is incorrect', () => {
        const tunnelAction = container.get<TunnelAction>(TYPES.TunnelAction);
        expect(() => tunnelAction.handleAction(connectionString, '')).to.throw();
        expect(() => tunnelAction.handleAction('', tunnelRuleString)).to.throw();
      });

      it('should return void if parameters is valid', () => {
        container
          .rebind(TYPES.TunnelService)
          .toConstantValue({ runLocalTunnel: () => Promise.resolve(null) });

        const tunnelAction = container.get<TunnelAction>(TYPES.TunnelAction);
        expect(tunnelAction.handleAction(connectionString, tunnelRuleString)).to
          .be.undefined;
      });

      afterEach(() => {
        container.rebind(TYPES.TunnelService).to(TunnelService);
        container.rebind(TYPES.Logger).toConstantValue(createLogger());
      });
    });
  });
});
