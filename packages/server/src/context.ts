import { ExpressContext } from "apollo-server-express";

export interface Context {
    req: Express.Request & any;
    userId?: string;
}

export function getContextFromRequest(ctx: ExpressContext): Context {
    const userId: string = (<any>ctx.req.jwtDecoded)?.id;

    return {
        req: ctx.req,
        userId
    };
}