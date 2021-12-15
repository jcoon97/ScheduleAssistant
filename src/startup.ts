import { Container } from "typedi";
import { Server } from "./Server";

const server: Server = Container.get(Server);
server.listen();