import { ExecutionResult, GraphQLError } from "graphql";
import { ForbiddenError } from "type-graphql";
import { Connection } from "typeorm";
import { User } from "../../../src/entities/User";
import { Server } from "../../../src/Server";
import { FAKES, FakeUserProperties, generateFakeUser } from "../../utils/generators";
import { gqlTest, GraphQLTestOptions } from "../../utils/graphql";

const QUERY_ME = (userId?: string): GraphQLTestOptions => ({
    context: {
        userId
    },
    source: `
        query {
            me {
                emailAddress
                googleId
                roleType {
                    level
                    name
                }
            }
        }
    `
});

describe("User GQL Tests", () => {
    let connection: Connection;
    let fakeUserDefault: User;

    beforeAll(async () => {
        connection = await Server.initConnection(true);
        fakeUserDefault = await generateFakeUser(connection, FAKES.USER_DEFAULT as FakeUserProperties);
    });

    it("should return user data", async () => {
        const result: ExecutionResult = await gqlTest(QUERY_ME(fakeUserDefault.id));
        expect(result.data).toBeDefined();
        expect(result.errors).toBeUndefined();
        expect(result.data).toEqual({
            me: {
                emailAddress: fakeUserDefault.emailAddress,
                googleId: fakeUserDefault.googleId,
                roleType: {
                    level: fakeUserDefault.roleType.level,
                    name: fakeUserDefault.roleType.name
                }
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