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
import { getLogger } from "./logger";
import { ProgramResolver } from "./resolvers/ProgramResolver";
import { UserResolver } from "./resolvers/UserResolver";

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

        return allowedEnvironments.includes(<string>process.env.NODE_ENV)
            ? <string>process.env.NODE_ENV
            : "development";
    }

    static async initConnection(dropSchema?: boolean): Promise<Connection> {
        return createConnection({
            type: "postgres",

            host: <string>process.env[`DB_${ Server.getEnvironment().toUpperCase() }_HOST`],
            port: parseInt(<string>process.env[`DB_${ Server.getEnvironment().toUpperCase() }_PORT`]),
            username: process.env[`DB_${ Server.getEnvironment().toUpperCase() }_USERNAME`],
            password: <string>process.env[`DB_${ Server.getEnvironment().toUpperCase() }_PASSWORD`],
            database: <string>process.env[`DB_${ Server.getEnvironment().toUpperCase() }_DATABASE`],

            dropSchema: dropSchema,
            entities: [ Program, User ],
            logging: process.env.NODE_ENV === "development",
            synchronize: process.env.NODE_ENV !== "production"
        });
    }

    private async initServer(): Promise<void> {
        // Attempt to connect to database first
        await Server.initConnection();
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
            secret: <string>process.env.JWT_TOKEN_SECRET
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