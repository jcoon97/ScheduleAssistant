import User from "./entities/User";

export interface Context {
    req: Express.Request & any;
    user?: User | undefined;
}