/**
 * Describes specific class for MPD errors.
 *
 * This will allow us to handle specific to MPD errors
 * separately from NodeJS and other errors.
 */
class Error {

  /**
   * Error code number.
   */
  private code: number;

  /**
   * Command which failed.
   */
  private cmd: string;

  /**
   * Error text.
   */
  private text: string;

  /**
   * Command position (actual only for command_lists, 0 in any cases for command).
   */
  private cmdPos: number;

  /**
   * Built markup which is ready to output for use.
   */
  private output: string;

  /**
   * Constructs an error.
   *
   * @param {[string|number]} errorInfo
   *   Array of strings and numbers describing returned error.
   *
   * @see ResponseParser.RESPONSE_PARSER_ERROR_PATTERN for details.
   */
  constructor(errorInfo: Array<any>) {
    this.code = errorInfo[1];
    this.cmdPos = errorInfo[2];
    this.cmd = errorInfo[3];
    this.text = errorInfo[4];
    this.output = `MPD returned an error: ${this.text} (command: ${this.cmd}, code: ${this.code}, position: ${this.cmdPos})`;
  }

}

export = Error;
