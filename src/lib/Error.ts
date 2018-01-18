/**
 * Describes specific class for MPD errors.
 *
 * This will allow us to handle specific to MPD errors
 * separately from NodeJS and other errors.
 */
export class Error {
    /**
     * Built markup which is ready to output for use.
     */
    private output: string;

    /**
     * Constructs an error.
     *
     * @param {[string|number]} errorInfo - Array of strings and numbers describing returned error.
     *
     * @see ResponseParser.RESPONSE_PARSER_ERROR_PATTERN for details.
     */
    constructor(errorInfo: Array<any>) {
        const [code, cmdPos, cmd, text] = errorInfo;
        this.output = `MPD returned an error: ${text} (command: ${cmd}, code: ${code}, position: ${cmdPos})`;
    }
}
