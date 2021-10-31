import { Logger } from "tslog";

const logger: Logger = new Logger();
export const getLogger = (): Logger => logger;