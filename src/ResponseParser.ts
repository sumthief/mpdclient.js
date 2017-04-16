import Command = require('./Command');
import CommandList = require('./CommandList');
import MPDError = require('./Error');

class ResponseParser {

  /**
   * Response received from MPD server.
   */
  private response: string;

  /**
   * Command or CommandList which gave us response property.
   */
  private command: any;

  /**
   * Pattern to check if error exists and collect info about it.
   *
   * @type {RegExp}
   */
  static readonly RESPONSE_PARSER_ERROR_PATTERN = /^ACK\s\[(\d+)@([^\]]+)\]\s\{([^\}]*)\}\s(.+)$/gm;

  constructor(response: string, command: any) {
    this.response = response;
    this.command = command;
  }

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
  public parse(resolve: any = null, reject: any = null) {
    let errorInfo: any = ResponseParser.RESPONSE_PARSER_ERROR_PATTERN.exec(this.response);
    if (errorInfo) {
      reject(new MPDError(errorInfo));
    }

    this.response = this.response
      .replace(/^OK$/gm, '')
      .trim();

    return this.command instanceof Command ? this.processCommand(resolve) : this.processCommandList(resolve);
  }

  /**
   * Process response for single command or command from CommandList.
   *
   * This command applies for parsing response for single Command
   * or command from CommandList with command_list_ok_begin mode.
   *
   * @param {*} resolve
   *   Resolve callback or null. If null passed it means that we parse command from CL.
   *
   * @returns {*}
   *   Array of built objects.
   */
  private processCommand(resolve: any = null) {
    let command = this.command.getCommand();
    let result = this.parseResponse(this.getCommandDelimiters()[command] || []);

    if (resolve) {
      resolve({response: result, type: 'command'});
    }
    else {
      return result;
    }
  }

  /**
   * Process response for command list.
   *
   * @param {function} resolve
   *   Resolve callback.
   */
  private processCommandList(resolve: any) {
    let result = [];
    // This case is pretty simple: just split response by delimiter and
    // parse separated response in mapping with set of commands.
    if (this.command.getMode() === CommandList.COMMAND_LIST_OK_BEGIN) {
      let commands = this.command.getCommands();
      this.response
        .split(CommandList.COMMAND_LIST_OK_SEPARATOR)
        .filter(item => item)
        .map(item => item.trim())
        .forEach((value, index) => {
          result.push({
            response: new ResponseParser(value, commands[index]).parse(),
            command: commands[index].getCommand()
          })
        });
    }
    else {
      let commandDelimiters = [];
      this.command
        .getCommands()
        .forEach((value, index) => {
          // Collect delimiters for each command from set of commands.
          // This will allow us parse response correct.
          commandDelimiters = commandDelimiters.concat(
            (this.getCommandDelimiters()[value.getCommand()] || []).filter(item => (commandDelimiters.indexOf(item) < 0))
          );
        });
      result = this.parseResponse(commandDelimiters);
    }
    resolve({response: result, type: 'commandList'});
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
   * @returns {Array}
   *   Array of delimiter keys.
   *
   * @todo: Check other commands output.
   * @todo: Maybe it should be generated when server started for reducing first request handle time.
   */
  private getCommandDelimiters() {
    let data = global['mpdCommandDelimiters'] || {};
    if (~Object.keys(data).length) {
      [
        [['lsinfo', 'listall', 'listallinfo'], ['file', 'directory', 'playlist']],
        [['listfiles'], ['file', 'directory']],
        [['update', 'rescan'], ['updating_db']],
        [['commands', 'notcommands'], ['command']],
        [['listplaylists'], ['playlist']],
        [['currentsong', 'playlistinfo', 'listplaylist', 'listplaylistinfo', 'playlistid'], ['file']],
        [['idle'], ['changed']],
        [['tagtype'], ['tagtype']],
        [['decoders'], ['plugin']],
        [['status'], ['volume']],
        [['stats'], ['uptime']],
      ].forEach((value, index) => {
        value[0].forEach((v, i) => {
          data[v] = value[1];
        });
      });
      global['mpdCommandDelimiters'] = data;
    }

    return data;
  }

  /**
   * Parse response and return array of objects.
   *
   * @param {Array} commandDelimiters
   *   Array of strings.
   *
   * @returns {Array}
   *   Array of objects.
   *
   * @see getCommandDelimiters().
   */
  private parseResponse(commandDelimiters: Array<string>) {
    let result = [];
    let obj = {};
    this.response
      .split('\n')
      .forEach((val, index) => {
        let [key, value] = val.split(': ');
        let isDelimiterKey = commandDelimiters.reduce((prev, current, index, src) => {
          return prev || current === key;
        }, false);
        if (isDelimiterKey && Object.keys(obj).length !== 0) {
          result.push(obj);
          obj = {};
        }
        // This allow us build correct response for structure with multiple keys
        // related to one object. See response of decoders command for example.
        if (typeof obj[key] !== 'undefined') {
          if (Array.isArray(obj[key])) {
            obj[key].push(value);
          }
          else {
            obj[key] = [obj[key], value];
          }
        }
        else {
          obj[key] = value;
        }
      });
    // Don't forget about last iteration.
    result.push(obj);

    return result;
  }

}

export = ResponseParser;
