// Copyright (c) 2019-present, Anton Makarov <zer0c14@gmail.com>
// See the LICENSE for more information.

/**
 * Inversion control types.
 */
export const TYPES = {
  Logger: Symbol.for('Tunnel/Logger'),
  TunnelService: Symbol.for('Tunnel/TunnelService'),

  LocalTunnelAction: Symbol.for('Tunnel/LocalTunnelAction'),
  RemoteTunnelAction: Symbol.for('Tunnel/RemoteTunnelAction'),

  SshClientClass: Symbol('Tunnel/SshClientClass'),
  SshClientHelper: Symbol.for('Tunnel/SshClientHelper'),
  SshClientFactory: Symbol.for('Tunnel/SshClientFactory'),

  SshServerClass: Symbol.for('Tunnel/SshServerClass'),
  SshServerFactory: Symbol.for('Tunnel/SshServerFactory'),

  LocalTunnelServerClass: Symbol.for('Tunnel/LocalTunnelServerClass'),
  LocalTunnelServerFactory: Symbol.for('Tunnel/LocalTunnelServerFactory'),

  RemoteTunnelServerClass: Symbol.for('Tunnel/RemoteTunnelServerClass'),
  RemoteTunnelServerFactory: Symbol.for('Tunnel/RemoteTunnelServerFactory'),

  TunnelRuleActionParser: Symbol.for('Tunnel/TunnelRuleActionParser'),
  ConnectionActionParser: Symbol.for('Tunnel/ConnectionActionParser'),
};
