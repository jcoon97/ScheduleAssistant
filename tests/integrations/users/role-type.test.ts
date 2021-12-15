import { ExecutionResult } from "graphql";
import { Connection } from "typeorm";
import { RoleType, User } from "../../../src/entities/User";
import { Server } from "../../../src/Server";
import { FAKES, FakeUserProperties, generateFakeUser } from "../../utils/generators";
import { gqlTest, GraphQLTestOptions } from "../../utils/graphql";

const QUERY_ROLE_TYPES = (userId: string): GraphQLTestOptions => ({
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

describe("User Role Type GQL Tests", () => {
    let connection: Connection;
    let fakeUserManager: User;

    beforeAll(async () => {
        connection = await Server.initConnection(true);
        fakeUserManager = await generateFakeUser(connection, FAKES.USER_LA_MANAGER as FakeUserProperties);
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

    afterAll(async () => {
        await connection.close();
    });
});