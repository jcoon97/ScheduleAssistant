import core from "express-serve-static-core";

declare module "express" {
    interface Request {
        jwtDecoded: unknown;
    }

    interface Query extends core.Query { }

    interface GoogleCallbackQuery extends Query {
        code: string;
    }

    export interface GoogleCallbackRequest<ReqBody = any, ReqQuery = GoogleCallbackQuery, URLParams = core.ParamsDictionary>
        extends Request<URLParams, any, ReqBody, ReqQuery> { }
}