import { IExecutable } from "./IExecutable";
import { Command } from "./Command";

export class CommandList implements IExecutable {

  /**
   * @inheritDoc
   */
  public query: string;

  /**
   * Array of Command instances.
   */
  private commands: Command[];

  /**
   * Execution mode. Allow values are: COMMAND_LIST_BEGIN and COMMAND_LIST_OK_BEGIN.
   */
  private mode: string;

  /**
   * One of allowed modes for work with command list in MPD.
   *
   * If this one will chosen then MPD will return response of command list
   * execution as it was a single command.
   *
   * @type {string}
   */
  static readonly COMMAND_LIST_BEGIN: string = 'command_list_begin\n';

  /**
   * Second one of allowed modes for work with command list in MPD.
   *
   * If this one will chosen then MPD will return response of command list
   * execution separated by COMMAND_LIST_OK_SEPARATOR.
   *
   * @type {string}
   */
  static readonly COMMAND_LIST_OK_BEGIN: string = 'command_list_ok_begin\n';

  /**
   * Service const for construction command list.
   *
   * @type {string}
   */
  static readonly COMMAND_LIST_END: string = 'command_list_end\n';

  /**
   * Command response separator for CL with COMMAND_LIST_OK_BEGIN execution mode.
   *
   * @type {RegExp}
   */
  static readonly COMMAND_LIST_OK_SEPARATOR: RegExp = /^list_OK$/gm;

  /**
   * Create command list.
   *
   * @param {Array} commands
   *   Array of Command objects.
   * @param {string} mode
   *   Mode of command list execution. This param impact on response returned from MPD.
   *
   * @return {object}
   *   Exemplar of CommandList object.
   *
   * @see https://www.musicpd.org/doc/protocol/command_lists.html for details.
   */
  constructor(commands: Command[], mode: string = CommandList.COMMAND_LIST_BEGIN) {
    this.commands = commands;
    this.mode = mode;
  }

  /**
   * Getter for commands.
   *
   * @returns {Array}
   *   Commands array.
   */
  public getCommands(): Command[] {
    return this.commands;
  }

  /**
   * Getter for mode.
   *
   * @returns {string}
   *   Mode.
   */
  public getMode(): string {
    return this.mode;
  }

  /**
   * @inheritDoc
   */
  public buildQuery(): string {
    if (!this.query) {
      let chunks: string[] = [ this.getMode() ];
      this.getCommands().forEach((value: Command, index: number) => {
        chunks.push(value.buildQuery());
      });
      chunks.push(CommandList.COMMAND_LIST_END);
      this.query = chunks.join('');
    }

    return this.query;
  }

}
