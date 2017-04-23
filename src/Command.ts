import {IExecutable} from "./IExecutable";

export class Command implements IExecutable {

  /**
   * @inheritDoc
   */
  public query: string;

  /**
   * Arguments passed to constructor.
   */
  private args: any[];

  /**
   * Arguments passed to constructor.
   */
  private command: string;

  constructor(command: string, args: any[] = []) {
    this.command = command.trim();
    this.args = args;
  }

  /**
   * @inheritDoc
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
   * @returns {any}
   *   Array of args.
   */
  public getArgs(): any[] {
    return this.args;
  }

  /**
   * Getter for command prop.
   *
   * @returns {any}
   *   Command string.
   */
  public getCommand(): string {
    return this.command;
  }

}
