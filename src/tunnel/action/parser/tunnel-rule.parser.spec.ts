// Copyright (c) 2019-present, Anton Makarov <zer0c14@gmail.com>
// See the LICENSE for more information.

import { expect } from 'chai';
import { it, describe } from 'mocha';
import { TunnelRuleActionParser } from './tunnel-rule.parser';

describe('tunnel-rule.parser', () => {
  describe('#TunnelRuleActionParser', () => {
    /**
     * Tunnel rule action parser parse.
     */
    describe('#TunnelRuleActionParser::parse', () => {
      it('should return object with three properties', () => {
        const tunnelRuleParser = new TunnelRuleActionParser();
        const tunnelRule = tunnelRuleParser.parse('8000:127.0.0.1:80');

        expect(tunnelRule).to.be.an('object');
        expect(tunnelRule).to.have.property('localPort', 8000);
        expect(tunnelRule).to.have.property('remoteAddress', '127.0.0.1');
        expect(tunnelRule).to.have.property('remotePort', 80);
        expect(tunnelRule).to.have.not.property('localAddress');
      });

      it('should return object with four properties', () => {
        const tunnelRuleParser = new TunnelRuleActionParser();
        const tunnelRule = tunnelRuleParser.parse(
          '192.168.1.1:8000:127.0.0.1:80',
        );

        expect(tunnelRule).to.be.an('object');
        expect(tunnelRule).to.have.property('localAddress', '192.168.1.1');
        expect(tunnelRule).to.have.property('localPort', 8000);
        expect(tunnelRule).to.have.property('remoteAddress', '127.0.0.1');
        expect(tunnelRule).to.have.property('remotePort', 80);
      });

      it('should throw error if parts more than four', () => {
        const tunnelRuleParser = new TunnelRuleActionParser();
        expect(() =>
          tunnelRuleParser.parse('192.168.1.1:8000:127.0.0.1:80:22'),
        ).to.throw(/tunnel rule is invalid/i);
      });

      it('should throw error if parts less than three', () => {
        const tunnelRuleParser = new TunnelRuleActionParser();
        expect(() => tunnelRuleParser.parse('192.168.1.10:22')).to.throw(
          /tunnel rule is invalid/i,
        );
      });
    });
  });
});
