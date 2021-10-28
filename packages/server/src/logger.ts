import { Logger } from "tslog";

const logger: Logger = new Logger();

/**
 * Get this application's `tslog` instance.
 */
export const getLogger = (): Logger => logger;