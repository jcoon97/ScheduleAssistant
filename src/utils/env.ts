import dotenv from "dotenv";

dotenv.config();

/**
 * Get an environment variable value, or if none was found, then return
 * the specified default value instead.
 *
 * @param key the key to search for, e.g. "PORT" for `process.env.PORT`
 * @param def the default value that should be returned if the value could
 * not be found from the specified `key`
 */
export const getEnvOrDefault = (key: string, def: string | null): string | null =>
    process.env[key] ? <string>process.env[key] : def;