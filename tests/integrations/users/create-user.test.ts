/*
import { ExecutionResult } from "graphql";
import { Connection } from "typeorm";
import { RoleType, User } from "../../../src/entities/User";
import { UserError } from "../../../src/graphql/UserError";
import { Server } from "../../../src/Server";
import { errorContainsField } from "../../utils/error";
import { FAKES, FakeUserProperties, generateFakeUser } from "../../utils/generators";
import { gqlTest, GraphQLTestOptions } from "../../utils/graphql";

const MUTATION_CREATE_USER = (userId: string, roleLevel: number): GraphQLTestOptions => ({
    context: {
        userId
    },
    source: `
        mutation createUser($input: CreateUserInput!) {
            userCreate(input: $input) {
                firstName
                lastName
                emailAddress
            }
        }
    `,
    variables: {
        input: {
            firstName: "First",
            lastName: "Last",
            emailAddress: "fake.test.user@example.com",
            roleLevel
        }
    }
});

describe("User Creation GQL Tests", () => {
    let connection: Connection;
    let fakeUserManager: User;

    beforeAll(async () => {
        connection = await Server.initConnection(true);
        fakeUserManager = await generateFakeUser(connection, FAKES.USER_LA_MANAGER as FakeUserProperties);
    });

    it("should throw error if role level could not be found", async () => {
        const result: ExecutionResult = await gqlTest(MUTATION_CREATE_USER(fakeUserManager.id, 999));
        expect(result.data).toBeDefined();
        expect(result.errors).toBeUndefined();

        const createData: any = result.data!.userCreate!;
        const userErrors: UserError[] = createData.userErrors!;
        expect(createData.user!).toBeNull();
        expect(Array.isArray(userErrors)).toBe(true);
        expect(errorContainsField(userErrors, "roleLevel"));
    });

    it.todo("should throw error if role level is greater than self");

    it("should create a new user", async () => {
        try {
            const result: ExecutionResult = await gqlTest(MUTATION_CREATE_USER(
                fakeUserManager.id,
                RoleType.LEARNING_ASSISTANT.level
            ));
            console.log(result);
            expect(result.data).toBeDefined();
            expect(result.errors).toBeUndefined();
            expect(result.data).toEqual({
                userCreate: {
                    firstName: "First",
                    lastName: "Last",
                    emailAddress: "fake.test.user@example.com"
                }
            });
        } catch (err) {
            console.error(err);
        }
    });

    it.todo("should throw error if user already exists by email address");

    afterAll(async () => {
        await connection.close();
    });
});
*/
