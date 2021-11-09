import { ExpressContext } from "apollo-server-express";

export interface Context {
    req: Express.Request & any;
    userId?: number;
}

export function getContextFromRequest(ctx: ExpressContext): Context {
    const jwtIdStr: string = (<any>ctx.req.jwtDecoded)?.id;
    let jwtId: number | undefined = parseInt(jwtIdStr);
    if (isNaN(jwtId)) jwtId = undefined;

    return {
        req: ctx.req,
        userId: jwtId
    };
}