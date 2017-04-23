export interface IExecutable {

  /**
   * Query string which will be written to socket.
   */
  query: string;

  /**
   * Build query string.
   *
   * Command should be first in query row. After command should follow space\tab all
   * arguments wrapped by quotes and separated by space\tab.
   *
   * @return string
   *   Built query string.
   */
  buildQuery(): string;

}
