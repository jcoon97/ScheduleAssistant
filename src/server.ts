import express, { Express, json, urlencoded } from "express";
import { getLogger } from "./logger";
import allRoutes from "./routes";

const app: Express = express();
const port: number = process.env.PORT ? parseInt(<string>process.env.PORT) : 3000;

app.use(json());
app.use(urlencoded({ extended: false }));
app.use(allRoutes);

app.listen(port, (): void => {
    getLogger().info(`Started Express server on port ${ port }...`);
});