import {IExecutable} from "./IExecutable";

export class Command implements IExecutable {

  /**
   * @inheritDoc
   */
  public query: string;

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
  public buildQuery(): string {
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
  public getArgs(): any[] {
    return this.args;
  }

  /**
   * Getter for command prop.
   *
   * @returns {*} - Command string.
   */
  public getCommand(): string {
    return this.command;
  }

}
