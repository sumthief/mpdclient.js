/// <reference.d='/node_modules/@types/node/index.d.ts' />
/// <reference.d='/node_modules/@types/es6-promise/index.d.ts' />

import { IExecutable } from "./IExecutable";
import { ResponseParser } from "./ResponseParser";
import * as net from "net";

export class Client {

  // @todo: Add tracking of idle status.

  constructor(private host: string, private port: number) { }

  /**
   * Create socket; connect and handle base response from server.
   *
   * @returns {Promise<T>|Promise}
   *   Promise which will pass connected socket with already handled start message or it will reject an error.
   */
  private connect() {
    return new Promise((resolve: any, reject: any) => {
      // As NodeJS works in async mode we can't store socket as
      // class property.
      let socket = new net.Socket();
      socket.connect(this.port, this.host);
      // Force returning result in human-readable view to evade toString conversion.
      socket.setEncoding('utf8');

      // Handle socket events.
      socket.on('data', (data: string) => {
        // Because there are can be multiple command invocation for the same client instance.
        // So it should be local variable passed as result to resolve callback.
        resolve(socket);
      });
      socket.on('error', (error) => {
        reject(error);
      });
    });
  }

  /**
   * Execute Command or CommandList.
   *
   * @param {*} command
   *   Command or CommandList exemplar.
   *
   * @returns {Promise<T>|Promise}
   *   Promise which will return parsed response or it will reject an error.
   */
  public execute(command: IExecutable) {
    return new Promise((resolve: any, reject: any) => {
      // Connect to sever and if success execute an command and close socket.
      this
        .connect()
        .then(
          (socket: any) => {
            let result = '';
            socket.on('data', (data: string) => {
              result += data;
            });
            socket.on('error', (error: any) => {
              reject(error);
            });
            socket.on('end', () => {
              // When we collected all data returned from MPD we can pass it to Parser.
              let responseParser = new ResponseParser(result, command);
              responseParser.parse(resolve, reject);
            });

            // Need to send FIN packet as we don't want to write something else.
            socket.end(command.buildQuery());
          },
          (error: any) => {
            reject(error);
          }
        );
    });
  }
}
