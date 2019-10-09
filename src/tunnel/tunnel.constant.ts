// Copyright (c) 2019-present, Anton Makarov <zer0c14@gmail.com>
// See the LICENSE for more information.

/**
 * Inversion control types.
 */
export const TYPES = {
  Logger: Symbol.for('Tunnel\\Logger'),
  TunnelAction: Symbol.for('Tunnel\\TunnelAction'),
  TunnelService: Symbol.for('Tunnel\\TunnelService'),
  TunnelRuleParser: Symbol.for('Tunnel\\TunnelRuleParser'),
  SshClientHelper: Symbol.for('Tunnel\\SshClientHelper'),
  SshServerHelper: Symbol.for('Tunnel\\SshServerHelper'),
  TcpServerFactory: Symbol.for('Tunnel\\TcpServerFactory'),
  SshClientFactory: Symbol.for('Tunnel\\SshClientFactory'),
  SshServerFactory: Symbol.for('Tunnel\\SshServerFactory'),
  ConnectionStringParser: Symbol.for('Tunnel\\ConnectionStringParser'),
};
