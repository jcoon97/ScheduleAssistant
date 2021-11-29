import { ExpressContext } from "apollo-server-express";

export interface Context {
    req: Express.Request & any;
    userId?: string;
}

export function getContextFromRequest(ctx: ExpressContext): Context {
    const userId: string = (ctx.req.jwtDecoded as any)?.id;

    return {
        req: ctx.req,
        userId
    };
}