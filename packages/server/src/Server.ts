import { ApolloServerPluginDrainHttpServer } from "apollo-server-core";
import { ApolloServer } from "apollo-server-express";
import dotenv from "dotenv";
import express, { Express } from "express";
import jwt from "express-jwt";
import { GraphQLSchema } from "graphql";
import http, { Server as HTTPServer } from "http";
import "reflect-metadata";
import { useContainer as useContainerRoutingControllers, useExpressServer } from "routing-controllers";
import { buildSchema } from "type-graphql";
import { Service } from "typedi";
import { Connection, createConnection, useContainer as useContainerTypeORM } from "typeorm";
import { Container } from "typeorm-typedi-extensions";
import { AuthChecker } from "./AuthChecker";
import { getContextFromRequest } from "./context";
import { GoogleController } from "./controllers/GoogleController";
import { Program } from "./entities/Program";
import { User } from "./entities/User";
import { UserResolver } from "./graphql/resolvers/UserResolver";
import { getLogger } from "./logger";
import { ProgramResolver } from "./graphql/resolvers/ProgramResolver";

dotenv.config();
useContainerTypeORM(Container);
useContainerRoutingControllers(Container);

@Service()
export class Server {
    static readonly PATH: string = "/graphql";
    static readonly PORT: number = parseInt(process.env.PORT ? process.env.PORT : "3000");

    private httpServer?: HTTPServer;

    constructor() {
        this.initServer();
    }

    static async buildSchema(emitSchema?: boolean): Promise<GraphQLSchema> {
        return buildSchema({
            authChecker: AuthChecker,
            container: Container,
            emitSchemaFile: emitSchema ?? true,
            resolvers: [ ProgramResolver, UserResolver ]
        });
    }

    static getEnvironment(): string {
        const allowedEnvironments: string[] = [ "development", "production", "test" ];

        return allowedEnvironments.includes(process.env.NODE_ENV as string)
            ? process.env.NODE_ENV as string
            : "development";
    }

    static async initConnection(dropSchema?: boolean, retries?: number): Promise<Connection> {
        try {
            return await createConnection({
                type: "postgres",

                host: process.env[`DB_${ Server.getEnvironment().toUpperCase() }_HOST`] as string,
                port: parseInt(process.env[`DB_${ Server.getEnvironment().toUpperCase() }_PORT`] as string),
                username: process.env[`DB_${ Server.getEnvironment().toUpperCase() }_USERNAME`] as string,
                password: process.env[`DB_${ Server.getEnvironment().toUpperCase() }_PASSWORD`] as string,
                database: process.env[`DB_${ Server.getEnvironment().toUpperCase() }_DATABASE`] as string,

                dropSchema: dropSchema,
                entities: [ Program, User ],
                logging: process.env.NODE_ENV === "development",
                synchronize: process.env.NODE_ENV !== "production"
            });
        } catch (err) {
            if (retries && retries > 0) {
                getLogger().error(`Server#initConnection() failed to establish connection, retrying ${ retries } more times...`);
                return Server.initConnection(dropSchema, retries - 1);
            } else {
                throw err;
            }
        }
    }

    private async initServer(): Promise<void> {
        await Server.initConnection(undefined, 3); // Try to connect up to 3 times before erroring out
        getLogger().info("Successfully established connection to database server");

        const app: Express = express();
        const httpServer: HTTPServer = http.createServer(app);
        const schema: GraphQLSchema = await Server.buildSchema(true);

        // Create ApolloServer instance
        const apolloServer: ApolloServer = new ApolloServer({
            context: getContextFromRequest,
            schema,
            plugins: [ ApolloServerPluginDrainHttpServer({ httpServer }) ]
        });

        // Apply Express-specific settings, e.g. using `routing-controllers`
        app.use(Server.PATH, jwt({
            algorithms: [ "HS512" ],
            credentialsRequired: false,
            userProperty: "jwtDecoded", // Remap `req.user` to `req.jwtDecoded`
            secret: process.env.JWT_TOKEN_SECRET as string
        }));

        useExpressServer(app, {
            controllers: [ GoogleController ]
        });

        // Start ApolloServer & apply Express middleware(s)
        await apolloServer.start();
        apolloServer.applyMiddleware({ app, path: Server.PATH });

        // Bind constant(s) to class properties
        this.httpServer = httpServer;
    }

    async listen(): Promise<void> {
        while (!this.httpServer) {
            getLogger().info("Waiting for `this.httpServer` to be defined...");
            await new Promise<void>(resolve => setTimeout(resolve, 1000));
        }

        this.httpServer.listen(Server.PORT, () => {
            getLogger().info(`Apollo server started on http://localhost:${ Server.PORT }${ Server.PATH }`);
            getLogger().info(`Express server started on http://localhost:${ Server.PORT }`);
        });
    }
}