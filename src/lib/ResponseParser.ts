///<reference path="../../node_modules/@types/node/index.d.ts"/>

import { MPDCommand as Command } from './Command';
import { MPDCommandList as CommandList } from './CommandList';
import { Error } from './Error';
import { objIsEmpty, objValues } from './Util';

export class ResponseParser {
    /**
     * Pattern to check if error exists and collect info about it.
     *
     * @type {RegExp}
     */
    static readonly RESPONSE_PARSER_ERROR_PATTERN = /^ACK\s\[(\d+)@([^\]]+)\]\s\{([^\}]*)\}\s(.+)$/gm;

    /**
     * MPD returns strange mapping between input and ouput.
     *
     * @type {{[string]: string}}
     */
    static readonly RESPONSE_TAG_MAPPING = {
        artist: 'Artist',
        albumartist: 'AlbumArtist',
        album: 'Album',
        date: 'Date',
        genre: 'Genre',
        title: 'Title',
        track: 'Track'
    };

    /**
     * Creates new response parser.
     *
     * @param {string} response - Response from MPD server.
     * @param {*} command - Command or CommandList.
     */
    constructor(private response: string, private command: any) {}

    /**
     * The only one public method which is also an entrypoint.
     *
     * @param {*} resolve
     *   Callable or null. See ES6-Promise for details.
     * @param {*} reject
     *   Callable or null. See ES6-Promise for details.
     *
     * @returns {Array}
     *   Array of object (case when we parse single command from CommandList).
     */
    parse(resolve: any = null, reject: any = null) {
        const errorInfo = ResponseParser.RESPONSE_PARSER_ERROR_PATTERN.exec(
            this.response
        );
        if (errorInfo) {
            reject(new Error(errorInfo));
        }

        this.response = this.response.replace(/^OK$/gm, '').trim();

        return this.command instanceof Command
            ? this.processCommand(resolve)
            : this.processCommandList(resolve);
    }

    /**
     * Process response for single command or command from CommandList.
     *
     * This command applies for parsing response for single Command
     * or command from CommandList with command_list_ok_begin mode.
     *
     * @param {*} resolve - Resolve callback or null. If null passed then it means that we parses command from CL.
     *
     * @returns {*[]|void} - Array of built objects/resolves promise.
     */
    private processCommand(resolve: any = null): any[] | void {
        const cmd = this.command.getCommand();
        let delimiters = this.getCommandDelimiters()[cmd] || [];
        // Split response by primary filter.
        if (cmd === 'list') {
            const filter = this.command.getArgs()[0];
            delimiters = [ResponseParser.RESPONSE_TAG_MAPPING[filter]];
        }
        const processedDelimiters = delimiters.reduce((prev, current) => {
            prev[current] = null;
            return prev;
        }, {});
        const result = this.parseResponse(processedDelimiters);

        if (resolve) {
            resolve({ response: result, type: 'command' });
        } else {
            return result;
        }
    }

    /**
     * Process response for command list.
     *
     * @param {function} resolve - Resolve callback.
     */
    private processCommandList(resolve: any): void {
        let result;
        const commands = this.command.getCommands();
        // This case is pretty simple: just split response by delimiter and
        // parse separated response in mapping with set of commands.
        if (this.command.getMode() === CommandList.COMMAND_LIST_OK_BEGIN) {
            result = this.response
                .split(CommandList.COMMAND_LIST_OK_SEPARATOR, commands.length)
                .map(item => item.trim())
                .reduce((prev, current, index) => {
                    const cmd = commands[index];
                    prev.push({
                        response: new ResponseParser(current, cmd).parse(),
                        command: cmd.getCommand()
                    });
                    return prev;
                }, []);
        } else {
            const commandDelimiters = commands.reduce((prev, cmd: Command) => {
                const command = cmd.getCommand();
                // Collect delimiters for each command from set of commands.
                // This will allow us parse response correct.
                if (typeof prev[command] === 'undefined') {
                    prev[command] = this.getCommandDelimiters()[command] || {};
                }

                return prev;
            }, {});
            result = this.parseResponse(commandDelimiters);
        }
        resolve({ response: result, type: 'commandList' });
    }

    /**
     * Get command delimiters.
     *
     * There are can be some commands (such as lsinfo or plalistinfo)
     * which returns collection of same objects as result. Also there
     * are exists command lists with standard execution mode (returns
     * single-row output).
     * So we need set of uniq keys for each command.
     *
     * @returns {object} - Delimiters merged into united array.
     *
     * @todo: Check other commands output.
     * @todo: Maybe it should be generated when server started for reducing first request handle time.
     */
    private getCommandDelimiters(): any {
        const data = global['mpdCommandDelimiters'] || {};
        if (objIsEmpty(data)) {
            [
                {
                    commands: ['lsinfo', 'listall', 'listallinfo'],
                    delimiters: ['file', 'directory', 'playlist']
                },
                { commands: ['listfiles'], delimiters: ['file', 'directory'] },
                { commands: ['update', 'rescan'], delimiters: ['updating_db'] },
                {
                    commands: ['commands', 'notcommands'],
                    delimiters: ['command']
                },
                { commands: ['listplaylists'], delimiters: ['playlist'] },
                {
                    commands: [
                        'currentsong',
                        'playlistinfo',
                        'listplaylist',
                        'listplaylistinfo',
                        'playlistid',
                        'search'
                    ],
                    delimiters: ['file']
                },
                { commands: ['idle'], delimiters: ['changed'] },
                { commands: ['tagtype'], delimiters: ['tagtype'] },
                { commands: ['decoders'], delimiters: ['plugin'] },
                { commands: ['status'], delimiters: ['volume'] },
                { commands: ['stats'], delimiters: ['uptime'] },
                {
                    commands: ['list'],
                    delimiters: objValues(ResponseParser.RESPONSE_TAG_MAPPING)
                }
            ].forEach(value => {
                value['commands'].forEach(v => (data[v] = value['delimiters']));
            });
            global['mpdCommandDelimiters'] = data;
        }

        return data;
    }

    /**
     * Parse response and return array of objects.
     *
     * @param {object} commandDelimiters - delimiters merged to united object.
     *
     * @returns {object[]} - Array of objects.
     *
     * @see getCommandDelimiters().
     */
    private parseResponse(commandDelimiters: any): any[] {
        let result = [],
            obj = {};
        this.response.split('\n').forEach(val => {
            const [key, value] = val.split(': ');
            const currentRowIsDelimiter =
                typeof commandDelimiters[key] !== 'undefined';
            // If this row is delimiter then we need finalize our object and reset obj.
            if (currentRowIsDelimiter && !objIsEmpty(obj)) {
                result.push(obj);
                obj = {};
            }
            // This allow us build correct response for structure with multiple keys
            // related to one object. See response of decoders command for example.
            if (key && value) {
                if (typeof obj[key] !== 'undefined') {
                    if (Array.isArray(obj[key])) {
                        obj[key].push(value);
                    } else {
                        obj[key] = [obj[key], value];
                    }
                } else {
                    obj[key] = value;
                }
            }
        });
        // Don't forget about last iteration. But we don't need to store empty object.
        if (!objIsEmpty(obj)) {
            result.push(obj);
        }

        return result;
    }
}
