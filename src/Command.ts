import {IExecutable} from "./IExecutable";

export class Command implements IExecutable {

  /**
   * @inheritDoc
   */
  public query: string;

  constructor(private command: string, private args: any[] = []) { }

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
