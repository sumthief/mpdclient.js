/// <reference.d='/node_modules/@types/node/index.d.ts' />
/// <reference.d='/node_modules/@types/es6-promise/index.d.ts' />

import net = require('net');
import Command = require('./Command');
import CommandList = require('./CommandList');
import ResponseParser = require('./ResponseParser');

class Client {

  // @todo: Add tracking of idle status.

  /**
   * Hostname where MPD server started.
   */
  private host;

  /**
   * Port which MPD server listens.
   */
  private port;

  constructor(host: string, port: number) {
    this.host = host;
    this.port = port;
  }

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
      socket.on('data', (data) => {
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
  public execute(command: any) {
    return new Promise((resolve, reject) => {
      // Connect to sever and if success execute an command and close socket.
      this
        .connect()
        .then(
          (socket: any) => {
            let result = '';

            // Need to send FIN packet as we don't want write something else.
            socket.end(command.buildQuery());

            // Handle socket events.
            socket.on('data', (data) => {
              result += data;
            });
            socket.on('error', (error) => {
              reject(error);
            });
            socket.on('end', () => {
              // When we collected all data returned from MPD we can pass it to Parser.
              let responseParser = new ResponseParser(result, command);
              responseParser.parse(resolve, reject);
            });
          },
          (error: any) => {
            reject(error);
          }
        );
    });
  }
}

export = Client;
