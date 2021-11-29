import { ExecutionResult, GraphQLError } from "graphql";
import { ForbiddenError } from "type-graphql";
import { Connection } from "typeorm";
import { RoleType, User } from "../../src/entities/User";
import { Server } from "../../src/Server";
import { FAKES, FakeUserProperties, generateFakeUser } from "../utils/generators";
import { gqlTest, GraphQLTestOptions } from "../utils/graphql";

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

const QUERY_ROLE_TYPES = (userId?: string): GraphQLTestOptions => ({
    context: {
        userId
    },
    source: `
        query {
            userRoleTypes {
                level
                name
            }
        }
    `
});

describe("User GQL Tests", () => {
    let connection: Connection;
    let fakeUserManager: User;

    beforeAll(async () => {
        connection = await Server.initConnection(true);
        fakeUserManager = await generateFakeUser(connection, FAKES.USER_LA_MANAGER as FakeUserProperties);
    });

    it("should return user data", async () => {
        const result: ExecutionResult = await gqlTest(QUERY_ME(fakeUserManager.id));
        expect(result.data).toBeDefined();
        expect(result.errors).toBeUndefined();
        expect(result.data).toEqual({
            me: {
                emailAddress: fakeUserManager.emailAddress,
                googleId: fakeUserManager.googleId,
                roleType: {
                    level: fakeUserManager.roleType.level,
                    name: fakeUserManager.roleType.name
                }
            }
        });
    });

    it("should return user role types", async () => {
        const result: ExecutionResult = await gqlTest(QUERY_ROLE_TYPES(fakeUserManager.id));
        const userRoles = RoleType.values().map((role: RoleType) => ({
            level: role.level,
            name: role.name
        }));

        expect(result.data).toBeDefined();
        expect(result.errors).toBeUndefined();
        expect(result.data).toEqual({
            userRoleTypes: [
                ...userRoles
            ]
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