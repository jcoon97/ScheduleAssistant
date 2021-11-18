import { ExecutionResult, GraphQLError } from "graphql";
import { ForbiddenError } from "type-graphql";
import { Connection } from "typeorm";
import { User } from "../../src/entities/User";
import { Server } from "../../src/Server";
import { FAKES, FakeUserProperties, generateFakeUser } from "../helpers/generators";
import { gqlTest, GraphQLTestOptions } from "../helpers/graphql";

const QUERY_ME = (userId?: string): GraphQLTestOptions => ({
    context: {
        userId
    },
    source: `
        query {
            me {
                emailAddress
                googleId
                roleType
            }
        }
    `
});

describe("User GQL Tests", () => {
    let connection: Connection;
    let fakeAdmin: User;

    beforeAll(async () => {
        connection = await Server.initConnection(true);
        fakeAdmin = await generateFakeUser(connection, FAKES.USER_ADMINISTRATOR as FakeUserProperties);
    });

    it("should return user data from `me` query", async () => {
        const result: ExecutionResult = await gqlTest(QUERY_ME(fakeAdmin.id));
        expect(result.data).toBeDefined();
        expect(result.errors).toBeUndefined();
        expect(result.data).toEqual({
            me: {
                emailAddress: fakeAdmin.emailAddress,
                googleId: fakeAdmin.googleId,
                roleType: fakeAdmin.roleType
            }
        });
    });

    it("should throw authentication error when no context is provided", async () => {
        const result: ExecutionResult = await gqlTest(QUERY_ME());
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