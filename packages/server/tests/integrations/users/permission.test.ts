import { ExecutionResult } from "graphql";
import { Connection } from "typeorm";
import { RoleType, User } from "../../../src/entities/User";
import { APIError, ErrorCode } from "../../../src/errors/APIError";
import { Server } from "../../../src/Server";
import { FAKES, FakeUserProperties, generateFakeUser } from "../../utils/generators";
import { gqlTest, GraphQLTestOptions } from "../../utils/graphql";

const MUTATION_ELEVATE_USER_ROLE = (currentUserId: string, elevateUserId: string, level: number): GraphQLTestOptions => ({
    context: {
        userId: currentUserId
    },
    source: `
        mutation elevateUserRole($level: Int!, $userId: ID!) {
            userElevateRole(level: $level, userId: $userId) {
                roleType {
                    level
                }
            }
        }
    `,
    variables: {
        level,
        userId: elevateUserId
    }
});

describe("User Permission GQL Tests", () => {
    let connection: Connection;
    let fakeUserDefault: User;
    let fakeUserLead: User;
    let fakeUserManager: User;

    beforeAll(async () => {
        connection = await Server.initConnection(true);
        fakeUserDefault = await generateFakeUser(connection, FAKES.USER_DEFAULT as FakeUserProperties);
        fakeUserLead = await generateFakeUser(connection, FAKES.USER_LEAD_LA as FakeUserProperties);
        fakeUserManager = await generateFakeUser(connection, FAKES.USER_LA_MANAGER as FakeUserProperties);
    });

    it("should not elevate permission of user with higher role", async () => {
        const roleType: RoleType = RoleType.SENIOR_LA;
        const result: ExecutionResult = await gqlTest(MUTATION_ELEVATE_USER_ROLE(fakeUserLead.id, fakeUserManager.id, roleType.level));
        expect(result.data).toBeNull();
        expect(result.errors).toHaveLength(1);

        const apiError: APIError = result.errors![0].originalError! as APIError;
        expect(apiError).toBeInstanceOf(APIError);
        expect(apiError.code).toEqual(ErrorCode.USER_CANNOT_ELEVATE_HIGHER_ROLE);
    });

    it("should not elevate permission to invalid/undefined role level", async () => {
        const result: ExecutionResult = await gqlTest(MUTATION_ELEVATE_USER_ROLE(fakeUserLead.id, fakeUserDefault.id, 999));
        expect(result.data).toBeNull();
        expect(result.errors).toHaveLength(1);

        const apiError: APIError = result.errors![0].originalError! as APIError;
        expect(apiError).toBeInstanceOf(APIError);
        expect(apiError.code).toEqual(ErrorCode.USER_ROLE_DOES_NOT_EXIST);
    });

    // lead la cannot modify default user to la manager
    it("should not elevate permission of user to role level equal or greater than self", async () => {
        const roleType: RoleType = RoleType.LA_MANAGER;
        const result: ExecutionResult = await gqlTest(MUTATION_ELEVATE_USER_ROLE(fakeUserLead.id, fakeUserDefault.id, roleType.level));
        expect(result.data).toBeNull();
        expect(result.errors).toHaveLength(1);

        const apiError: APIError = result.errors![0].originalError! as APIError;
        expect(apiError).toBeInstanceOf(APIError);
        expect(apiError.code).toEqual(ErrorCode.USER_ROLE_GREATER_EQUAL_THAN_SELF);
    });

    // lead la can modify default user to senior la
    it("should elevate user permission to specified role level", async () => {
        const roleType: RoleType = RoleType.SENIOR_LA;
        const result: ExecutionResult = await gqlTest(MUTATION_ELEVATE_USER_ROLE(fakeUserLead.id, fakeUserDefault.id, roleType.level));
        expect(result.data).toBeDefined();
        expect(result.errors).toBeUndefined();
        expect(result.data).toEqual({
            userElevateRole: {
                roleType: {
                    level: roleType.level
                }
            }
        });
    });

    afterAll(async () => {
        await connection.close();
    });
});