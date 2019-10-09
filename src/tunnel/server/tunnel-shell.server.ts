// Copyright (c) 2019-present, Anton Makarov <zer0c14@gmail.com>
// See the LICENSE for more information.

import { Logger } from 'pino';
import { IRemoteTunnelServerFactory } from '../factory';
import {
  IShellClientRequestContext,
  BaseShellServer,
  IBaseShellServerOptions,
} from './shell';

/**
 * Tunnel shell server options interface.
 */
export interface ITunnelShellServerOptions extends IBaseShellServerOptions {
  logger: Logger;
  remoteTunnelServerFactory: IRemoteTunnelServerFactory;
}

/**
 * Tunnel shell server.
 */
export class TunnelShellServer extends BaseShellServer {
  /**
   * Logger.
   */
  public logger: Logger;

  /**
   * Remote tunnel server factory.
   */
  protected remoteTunnelServerFactory: IRemoteTunnelServerFactory;

  /**
   * Constructor.
   *
   * @param options
   */
  public constructor(options: ITunnelShellServerOptions) {
    super(options);
    this.logger = options.logger;
    this.remoteTunnelServerFactory = options.remoteTunnelServerFactory;
    this.on('request', this.handleRequest.bind(this));
  }

  /**
   * Handles request.
   */
  protected handleRequest(context: IShellClientRequestContext): void {
    if (context.name !== 'tcpip-forward') {
      return context.reject();
    }

    const { client, info } = context;
    const remoteTunnelServer = this.remoteTunnelServerFactory.createServer({
      sshClient: client.getConnection(),
      forwardAddress: info.bindAddr,
      forwardPort: info.bindPort,
    });

    remoteTunnelServer
      .listen(info.bindPort, info.bindAddr)
      .then(() =>
        client.getConnection().on('end', () =>
          remoteTunnelServer.close().catch(error => {
            this.logger.error(error);
          }),
        ),
      )
      .catch(error => {
        this.logger.error(error);
        client.getConnection().end();
      });

    context.accept();
  }
}
