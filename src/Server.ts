import express, { Express, json, urlencoded } from "express";
import "reflect-metadata";
import { Service } from "typedi";
import "./dayjs";
import { getLogger } from "./logger";
import routes from "./routes";
import { getEnvOrDefault } from "./utils/env";

@Service()
export class Server {
    static readonly PORT: number = parseInt(
        <string>getEnvOrDefault("PORT", "3000")
    );

    private readonly app: Express;

    constructor() {
        this.app = express();
    }

    bootstrap(): void {
        this.app.use(json());
        this.app.use(urlencoded({ extended: false }));
        this.app.use(routes);

        this.app.listen(Server.PORT, (): void => {
            getLogger().info(`Started Express server on port ${ Server.PORT }`);
        });
    }
}