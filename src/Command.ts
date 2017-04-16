class Command {

  /**
   * Result query which will be send to MPD.
   */
  private query;

  /**
   * Arguments passed to constructor.
   */
  private args;

  /**
   * Arguments passed to constructor.
   */
  private command;

  constructor(command, args = []) {
    this.command = command.trim();
    this.args = args;
  }

  /**
   * Build query.
   *
   * Command should be first in query row. After command should follow space\tab all
   * arguments wrapped by quotes and separated by space\tab.
   *
   * @returns {any}
   *   Command instance.
   */
  public buildQuery() {
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
  public getArgs() {
    return this.args;
  }

  /**
   * Getter for command prop.
   *
   * @returns {any}
   *   Command string.
   */
  public getCommand() {
    return this.command;
  }

}

export = Command;
