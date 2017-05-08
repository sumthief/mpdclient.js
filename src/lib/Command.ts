import {IExecutable} from "./IExecutable";

class Command implements IExecutable {

  /**
   * @inheritDoc
   */
  query: string;

  /**
   * Creates new command.
   *
   * @param {string} command - Command for execution.
   * @param {*[]} args - Optional arguments for
   *
   * @constructor
   */
  constructor(private command: string, private args: any[] = []) {
    this.command = command.trim();
  }

  /**
   * Query should have this form:
   *  command\t"arg1"\t"arg2"\t"arg3"\t"argN"\n
   *
   * @return {string} - Built query.
   */
  buildQuery(): string {
    if (!this.query) {
      let chunks = [this.command];
      this.args.forEach((value, index) => {
        chunks.push('"' + value.toString().replace('"', '\'') + '"');
      });
      this.query = chunks.join('\t') + '\n';
    }

    return this.query;
  }

  /**
   * Getter for args prop.
   *
   * @returns {*} - Array of args.
   */
  getArgs(): any[] {
    return this.args;
  }

  /**
   * Getter for command prop.
   *
   * @returns {*} - Command string.
   */
  getCommand(): string {
    return this.command;
  }

}

export { Command as MPDCommand };