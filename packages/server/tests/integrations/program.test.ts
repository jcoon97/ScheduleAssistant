import { ExecutionResult, GraphQLError } from "graphql";
import { ArgumentValidationError, ForbiddenError } from "type-graphql";
import { Connection } from "typeorm";
import { Program } from "../../src/entities/Program";
import { User } from "../../src/entities/User";
import { APIError, ErrorCode } from "../../src/errors/APIError";
import { Server } from "../../src/Server";
import {
    FakeProgramProperties,
    FAKES,
    FakeUserProperties,
    generateFakeProgram,
    generateFakeUser
} from "../utils/generators";
import { gqlTest, GraphQLTestOptions } from "../utils/graphql";

const MUTATION_ASSIGN_USER_TO_PROGRAM = (
    userId: string,
    variables: {
        programId: string,
        userId: string
    }
): GraphQLTestOptions => ({
    context: {
        userId
    },
    source: `
        mutation assignProgramUser($programId: ID!, $userId: ID!) {
            programAssignUser(programId: $programId, userId: $userId) {
                users {
                    emailAddress
                }
            }
        }
    `,
    variables
});

const MUTATION_CHANGE_PROGRAM_LEAD_OR_MANAGER = (
    userId: string,
    variables: {
        programId: string,
        userId: string
    }
): GraphQLTestOptions => ({
    context: {
        userId
    },
    source: `
        mutation changeProgramLeadOrManager($programId: ID!, $userId: ID!) {
            programChangeLeadOrManager(programId: $programId, userId: $userId) {
                leadOrManager {
                    emailAddress
                }
            }
        }
    `,
    variables
});

const MUTATION_CREATE_PROGRAM = (userId: string): GraphQLTestOptions => ({
    context: {
        userId
    },
    source: `
        mutation createProgram($input: CreateProgramInput!) {
            programCreate(input: $input) {
                abbreviation
                name
            }
        }
    `,
    variables: {
        input: {
            abbreviation: "FSF",
            name: "Full Stack Flex"
        }
    }
});

describe("Program GQL Tests", () => {
    let connection: Connection;
    let fakeAdmin: User;
    let fakeDefaultUser: User;
    let fakeProgram: Program;

    beforeAll(async () => {
        connection = await Server.initConnection(true);
        fakeAdmin = await generateFakeUser(connection, FAKES.USER_ADMINISTRATOR as FakeUserProperties);
        fakeDefaultUser = await generateFakeUser(connection, FAKES.USER_DEFAULT as FakeUserProperties);
        fakeProgram = await generateFakeProgram(connection, FAKES.PROGRAM as FakeProgramProperties);
    });

    it("should create new program", async () => {
        const result: ExecutionResult = await gqlTest(MUTATION_CREATE_PROGRAM(fakeAdmin.id));
        expect(result.data).toBeDefined();
        expect(result.errors).toBeUndefined();
        expect(result.data).toEqual({
            programCreate: {
                abbreviation: "FSF",
                name: "Full Stack Flex"
            }
        });
    });

    it("should throw error if user is not administrator", async () => {
        const result: ExecutionResult = await gqlTest(MUTATION_CREATE_PROGRAM(fakeDefaultUser.id));
        expect(result.data).toBeNull();
        expect(result.errors).toHaveLength(1);

        const error: GraphQLError = result.errors![0];
        expect(error.originalError).toBeInstanceOf(ForbiddenError);
        expect(error.path).toContain("programCreate");
    });

    it("should throw error if program already exists by abbreviation and/or name", async () => {
        const result: ExecutionResult = await gqlTest(MUTATION_CREATE_PROGRAM(fakeAdmin.id));
        expect(result.data).toBeNull();
        expect(result.errors).toHaveLength(1);

        const validationError: ArgumentValidationError = result.errors![0].originalError! as ArgumentValidationError;
        expect(validationError).toBeInstanceOf(ArgumentValidationError);
        expect(validationError.validationErrors).toHaveLength(2);
        expect(validationError.validationErrors[0].property).toEqual("abbreviation");
        expect(validationError.validationErrors[1].property).toEqual("name");
    });

    it("should assign user to program", async () => {
        const result: ExecutionResult = await gqlTest(MUTATION_ASSIGN_USER_TO_PROGRAM(fakeAdmin.id, {
            programId: fakeProgram.id,
            userId: fakeDefaultUser.id
        }));
        expect(result.data).toBeDefined();
        expect(result.errors).toBeUndefined();
        expect(result.data).toEqual({
            programAssignUser: {
                users: [
                    { emailAddress: fakeDefaultUser.emailAddress }
                ]
            }
        });
    });

    it("should throw error if user is already assigned to program", async () => {
        const result: ExecutionResult = await gqlTest(MUTATION_ASSIGN_USER_TO_PROGRAM(fakeAdmin.id, {
            programId: fakeProgram.id,
            userId: fakeDefaultUser.id
        }));
        expect(result.data).toBeNull();
        expect(result.errors).toHaveLength(1);

        const apiError: APIError = result.errors![0].originalError! as APIError;
        expect(apiError).toBeInstanceOf(APIError);
        expect(apiError.code).toEqual(ErrorCode.PROGRAM_USER_ALREADY_ASSIGNED);
    });

    it("should assign user as lead/manager of program", async () => {
        const result: ExecutionResult = await gqlTest(MUTATION_CHANGE_PROGRAM_LEAD_OR_MANAGER(fakeAdmin.id, {
            programId: fakeProgram.id,
            userId: fakeAdmin.id
        }));
        expect(result.data).toBeDefined();
        expect(result.errors).toBeUndefined();
        expect(result.data).toEqual({
            programChangeLeadOrManager: {
                leadOrManager: {
                    emailAddress: fakeAdmin.emailAddress
                }
            }
        });
    });

    it("should throw error if user is already assigned as lead/manager of program", async () => {
        const result: ExecutionResult = await gqlTest(MUTATION_CHANGE_PROGRAM_LEAD_OR_MANAGER(fakeAdmin.id, {
            programId: fakeProgram.id,
            userId: fakeAdmin.id
        }));
        expect(result.data).toBeNull();
        expect(result.errors).toHaveLength(1);

        const apiError: APIError = result.errors![0].originalError! as APIError;
        expect(apiError).toBeInstanceOf(APIError);
        expect(apiError.code).toEqual(ErrorCode.PROGRAM_USER_ALREADY_LEAD_MANAGER);
    });

    afterAll(async () => {
        await connection.close();
    });
});