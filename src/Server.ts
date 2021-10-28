import express, { Express, json, urlencoded } from "express";
import "reflect-metadata";
import { Container, Service } from "typedi";
import { getLogger } from "./logger";
import routes from "./routes";
import { getEnvOrDefault } from "./utils/env";

const PORT: number = parseInt(
    getEnvOrDefault("PORT", "3000")
);

@Service()
export class Server {
    private readonly app: Express;

    constructor() {
        this.app = express();
    }

    bootstrap(): void {
        this.app.use(json());
        this.app.use(urlencoded({ extended: false }));
        this.app.use(routes);

        this.app.listen(PORT, (): void => {
            getLogger().info(`Started Express server on port ${ PORT }`);
        });
    }
}

// Application Entry: Grab instance of `Server` and call `bootstrap()`.
const server: Server = Container.get<Server>(Server);
server.bootstrap();