import * as faker from "faker";
import { ExecutionResult, GraphQLError } from "graphql";
import { ForbiddenError } from "type-graphql";
import { Connection, Repository } from "typeorm";
import { RoleType, User } from "../../src/entities/User";
import { Server } from "../../src/Server";
import { gqlTest } from "../helpers/graphql";

describe("Me Query Tests", () => {
    let connection: Connection;
    let currentUser: User;

    const meQuery = `
        query {
            me {
                id
                firstName
                lastName
                emailAddress
                googleId
                roleType
            }
        }
    `;

    beforeAll(async () => {
        connection = await Server.initConnection(true);
    });

    it("should connect to database without errors", () => {
        expect(connection).toBeDefined();
    });

    it("should create user entity", async () => {
        const repository: Repository<User> = connection.getRepository(User);
        const newUser: User = repository.create({
            firstName: faker.name.firstName(),
            lastName: faker.name.lastName(),
            emailAddress: faker.internet.email(),
            googleId: faker.random.alphaNumeric(12),
            roleType: RoleType.ADMIN
        });

        currentUser = await repository.save(newUser);
        expect(currentUser).toBeDefined();
        expect(currentUser.id).toBeDefined();
        expect(currentUser.createdDate).toBeDefined();
    });

    it("should return user data from `me` query", async () => {
        const result: ExecutionResult = await gqlTest({
            context: {
                userId: currentUser.id
            },
            source: meQuery
        });

        expect(result.data).toBeDefined();
        expect(result.errors).toBeUndefined();
        expect(result.data).toEqual({
            me: {
                id: currentUser.id,
                firstName: currentUser.firstName,
                lastName: currentUser.lastName,
                emailAddress: currentUser.emailAddress,
                googleId: currentUser.googleId,
                roleType: currentUser.roleType
            }
        });
    });

    it("should throw authentication error when no context is provided", async () => {
        const result: ExecutionResult = await gqlTest({
            source: meQuery
        });

        expect(result.data).toEqual({ me: null });
        expect(result.errors).toHaveLength(1);
        const error: GraphQLError = result.errors![0];
        expect(error.originalError).toBeInstanceOf(ForbiddenError);
        expect(error.path).toContain("me");
    });

    afterAll(async () => {
        await connection.close();
    });
});