// Copyright (c) 2019-present, Anton Makarov <zer0c14@gmail.com>
// See the LICENSE for more information.

/**
 * Shell server module.
 */
declare module 'ssh2-shell-server' {
  import { Verify } from 'crypto';
  import { EventEmitter } from 'events';
  import {
    AuthContext,
    Connection,
    EncryptedPrivateKey,
    PasswordAuthContext,
    PublicKeyAuthContext,
  } from 'ssh2';

  import ShellClient from 'ssh2-shell-server/lib/shell-client';
  import ShellSession from 'ssh2-shell-server/lib/shell-session';

  export interface IShellServerOptions {
    hostKeys: (Buffer | string | EncryptedPrivateKey)[];
    port?: number;
  }

  export interface IAuthenticator {
    methodName: string;
    authenticate(ctx: AuthContext): Promise<boolean>;
  }

  export interface ICreationContext {
    client: ShellClient;
    session: ShellSession;
  }
  export interface IEndContext extends ICreationContext {}
  export interface IErrorContext extends ICreationContext {
    error: Error;
  }

  export class ShellServer extends EventEmitter {
    protected _configuration: IShellServerOptions;
    protected _authenticators: { [p: string]: IAuthenticator };

    constructor(options: IShellServerOptions);
    public listen(): Promise<void>;
    public registerAuthenticator(authenticator: IAuthenticator): ShellServer;
    protected _handleIncoming(client: Connection): void;
    protected _handleSessionCreated(creationContext: ICreationContext): void;
    protected _handleSessionEnded(endContext: IEndContext): void;
    protected _handleSessionError(errorContext: IErrorContext): void;
  }

  export interface IAuthenticateByPasswordCheckPassword {
    (username: string, password: string): boolean;
  }

  export interface IAuthenticateByPublicKeyValidate {
    (algorithm: string, data: Buffer, ctx: PublicKeyAuthContext):
      | Promise<boolean>
      | boolean;
  }

  export interface IAuthenticateByPublicKeyVerify {
    (
      verifier: Verify,
      signature: Buffer | undefined,
      ctx: PublicKeyAuthContext,
    ): Promise<boolean> | boolean;
  }

  export namespace Authenticators {
    class AuthenticateByPassword implements IAuthenticator {
      public methodName: 'password';
      protected _checkPassword: IAuthenticateByPasswordCheckPassword;
      constructor(checkPassword: IAuthenticateByPasswordCheckPassword);
      authenticate(ctx: PasswordAuthContext): Promise<boolean>;
    }

    class AuthenticateByPublicKey implements IAuthenticator {
      public methodName: 'publickey';
      protected _validate: IAuthenticateByPublicKeyValidate;
      protected _verify: IAuthenticateByPublicKeyVerify;

      constructor(
        validate: IAuthenticateByPublicKeyValidate,
        verify: IAuthenticateByPublicKeyVerify,
      );

      public authenticate(ctx: PublicKeyAuthContext): Promise<boolean>;
      protected _getVerifier(ctx: PublicKeyAuthContext): Verify;
    }

    export class AuthenticateAny implements IAuthenticator {
      public methodName: 'none';
      public authenticate(ctx: PasswordAuthContext): Promise<true>;
    }
  }
}

/**
 * Shell client module.
 */
declare module 'ssh2-shell-server/lib/shell-client' {
  import { EventEmitter } from 'events';
  import { Session, AuthContext, Connection } from 'ssh2';

  class ShellClient extends EventEmitter {
    constructor(client: Connection, authenticators: any);
    protected _client: Connection;
    protected _handleAuthentication(ctx: AuthContext): void;
    protected _authenticationMethodRemains(methodName: string): boolean;
    protected _handleReady(): void;
    protected _handleSession(
      accept: () => Session,
      reject: () => boolean,
    ): void;
    protected _handleEnd(accept: () => Session, reject: () => boolean): void;
    protected _handleError(error: Error): void;
  }

  export = ShellClient;
}

/**
 * Shell session module.
 */
declare module 'ssh2-shell-server/lib/shell-session' {
  import { EventEmitter } from 'events';
  import {
    Session,
    PseudoTtyInfo,
    ServerChannel,
    WindowChangeInfo,
  } from 'ssh2';

  class ShellSession extends EventEmitter {
    public username: string;
    public authentication: boolean;
    protected _session: Session;
    protected _initialWindow: { rows: number; cols: number };
    protected _stream: ServerChannel;
    constructor(username: string, session: Session, authentication: boolean);

    protected _declarePTY(
      accept: () => boolean,
      reject: () => boolean,
      info: PseudoTtyInfo,
    ): void;

    protected _windowChange(
      accept: () => boolean,
      reject: () => boolean,
      info: WindowChangeInfo,
    ): void;

    protected _initializeShell(
      accept: () => ServerChannel,
      reject: () => boolean,
    ): void;

    protected _handleError(error: Error): void;
  }

  export = ShellSession;
}
