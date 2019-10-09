// Copyright (c) 2019-present, Anton Makarov <zer0c14@gmail.com>
// See the LICENSE for more information.

import {
  Client,
  ClientChannel,
  ConnectConfig,
  ExecOptions,
  SFTPWrapper,
} from 'ssh2';

export interface ISshClientHelper {
  connect(client: Client, options: ConnectConfig): Promise<Client>;
  exec(client: Client, command: string, options?: ExecOptions): Promise<string>;
  sftp(client: Client): Promise<SFTPWrapper>;

  spawn(
    client: Client,
    command: string,
    options?: ExecOptions,
  ): Promise<ClientChannel>;
}

/**
 * Ssh client helper.
 */
export class SshClientHelper {
  /**
   * Connects to ssh server.
   *
   * @param client
   * @param options
   */
  public static connect(
    client: Client,
    options: ConnectConfig,
  ): Promise<Client> {
    let connectionError = null;
    return new Promise((resolve, reject) => {
      client
        .on('ready', () => resolve(client))
        .on('error', error => (connectionError = error))
        .on('close', () => reject(connectionError))
        .connect(options);
    });
  }

  /**
   * Executes a command on the server.
   *
   * @param client
   * @param command
   * @param options
   */
  public static exec(
    client: Client,
    command: string,
    options: ExecOptions = {},
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const exec = (resolve, reject) =>
        client.exec(command, options, (error, stream: ClientChannel) => {
          if (error) {
            return reject(error);
          }

          const createStreamPromise = (stream): Promise<Buffer> =>
            new Promise((resolve, reject) => {
              let error = null;
              let buffer = Buffer.from([]);
              stream
                .on('data', data => {
                  buffer = Buffer.concat([buffer, data]);
                })
                .on('error', err => (error = err))
                .on('close', () => (error ? reject(error) : resolve(buffer)));
            });

          Promise.all([
            createStreamPromise(stream),
            createStreamPromise(stream.stderr),
          ])
            .then(([stdoutBuffer, stderrBuffer]) => {
              stderrBuffer.length
                ? reject(stderrBuffer.toString().trim())
                : resolve(stdoutBuffer.toString().trim());
            })
            .catch(error => reject(error));
        });

      if (!exec(resolve, reject)) {
        client.on('continue', () => exec(resolve, reject));
      }
    });
  }

  /**
   * Spawns a command on the server.
   *
   * @param client
   * @param command
   * @param options
   */
  public static spawn(
    client: Client,
    command: string,
    options: ExecOptions = {},
  ): Promise<ClientChannel> {
    return new Promise((resolve, reject) => {
      const spawn = (resolve, reject) =>
        client.exec(command, options, (error, stream) => {
          error ? reject(error) : resolve(stream);
        });

      if (!spawn(resolve, reject)) {
        client.on('continue', () => spawn(resolve, reject));
      }
    });
  }

  /**
   * Returns sftp wrapper.
   *
   * @param client
   */
  public static sftp(client: Client): Promise<SFTPWrapper> {
    return new Promise((resolve, reject) => {
      const sftp = (resolve, reject) =>
        client.sftp((error, sftp) => (error ? reject(error) : resolve(sftp)));

      if (!sftp(resolve, reject)) {
        client.on('continue', () => sftp(resolve, reject));
      }
    });
  }
}
