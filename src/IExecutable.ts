export interface IExecutable {

  /**
   * Query string which will be written to socket.
   */
  query: string;

  /**
   * Build query string.
   *
   * @return string
   *   Built query string.
   */
  buildQuery(): string;

}
