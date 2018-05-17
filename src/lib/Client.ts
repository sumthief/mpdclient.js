/// <reference.d='/node_modules/@types/node/index.d.ts' />
/// <reference.d='/node_modules/@types/es6-promise/index.d.ts' />

import { Executable } from './executable.interface';
import { ResponseParser } from './ResponseParser';
import { Socket } from 'net';

class Client {
    // @todo: Add tracking of idle status.

    /**
     * Creates new client.
     *
     * @param {string} host - Hostname of MPD server.
     * @param {number} port - Port of MPD server.
     */
    constructor(private host: string, private port: number) {}

    /**
     * Create socket; connect and handle base response from server.
     *
     * @returns {Promise<(Socket|string)>} - Promise obj with connected socket, error otherwise.
     */
    private connect(): Promise<Socket | string> {
        return new Promise((resolve, reject) => {
            // As NodeJS works in async mode we can't store socket as
            // class property.
            const socket = new Socket();
            socket.connect(this.port, this.host);
            // Force returning result in human-readable view to evade toString conversion.
            socket.setEncoding('utf8');

            // Handle socket events.
            socket.on('data', (data: string) => {
                // Because there are can be multiple command invocation for the same client instance.
                // So it should be local variable passed as result to resolve callback.
                resolve(socket);
            });
            socket.on('error', error => {
                reject(error);
            });
        });
    }

    /**
     * Execute Executable object.
     *
     * @param {Executable} command - Command or CommandList exemplar.
     *
     * @returns {Promise<string>} - Promise which will return parsed response or it will reject with an error.
     */
    execute(command: Executable): Promise<string> {
        return new Promise((resolve, reject) => {
            // Connect to sever and if success execute an command and close socket.
            this.connect().then(
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
                        let responseParser = new ResponseParser(
                            result,
                            command
                        );
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

export { Client as MPDClient };
