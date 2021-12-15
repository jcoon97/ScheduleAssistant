import { ExecutionResult, GraphQLError } from "graphql";
import { ArgumentValidationError, ForbiddenError } from "type-graphql";
import { Connection } from "typeorm";
import { Program } from "../../src/entities/Program";
import { User } from "../../src/entities/User";
import { UserError } from "../../src/graphql/errors/UserError";
import { Server } from "../../src/Server";
import { errorContainsField } from "../utils/error";
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
                program {
                    users {
                        emailAddress
                    }    
                }
                userErrors {
                    field
                    message
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
                program {
                    abbreviation
                    name
                }
                userErrors {
                    field
                    message
                }
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
    let fakeUserManager: User;
    let fakeUserDefault: User;
    let fakeProgram: Program;

    beforeAll(async () => {
        connection = await Server.initConnection(true);
        fakeUserManager = await generateFakeUser(connection, FAKES.USER_LA_MANAGER as FakeUserProperties);
        fakeUserDefault = await generateFakeUser(connection, FAKES.USER_DEFAULT as FakeUserProperties);
        fakeProgram = await generateFakeProgram(connection, FAKES.PROGRAM as FakeProgramProperties);
    });

    it("should create new program", async () => {
        const result: ExecutionResult = await gqlTest(MUTATION_CREATE_PROGRAM(fakeUserManager.id));
        expect(result.data).toBeDefined();
        expect(result.errors).toBeUndefined();
        expect(result.data).toEqual({
            programCreate: {
                program: {
                    abbreviation: "FSF",
                    name: "Full Stack Flex"
                },
                userErrors: []
            }
        });
    });

    it("should throw error if user is not administrator", async () => {
        const result: ExecutionResult = await gqlTest(MUTATION_CREATE_PROGRAM(fakeUserDefault.id));
        expect(result.data).toBeNull();
        expect(result.errors).toHaveLength(1);

        const error: GraphQLError = result.errors![0];
        expect(error.originalError).toBeInstanceOf(ForbiddenError);
        expect(error.path).toContain("programCreate");
    });

    it("should throw error if program already exists by abbreviation and/or name", async () => {
        const result: ExecutionResult = await gqlTest(MUTATION_CREATE_PROGRAM(fakeUserManager.id));
        expect(result.data).toBeNull();
        expect(result.errors).toHaveLength(1);

        const validationError: ArgumentValidationError = result.errors![0].originalError! as ArgumentValidationError;
        expect(validationError).toBeInstanceOf(ArgumentValidationError);
        expect(validationError.validationErrors).toHaveLength(2);
        expect(validationError.validationErrors[0].property).toEqual("abbreviation");
        expect(validationError.validationErrors[1].property).toEqual("name");
    });

    it("should assign user to program", async () => {
        const result: ExecutionResult = await gqlTest(MUTATION_ASSIGN_USER_TO_PROGRAM(fakeUserManager.id, {
            programId: fakeProgram.id,
            userId: fakeUserDefault.id
        }));
        expect(result.data).toBeDefined();
        expect(result.errors).toBeUndefined();
        expect(result.data).toEqual({
            programAssignUser: {
                program: {
                    users: [
                        { emailAddress: fakeUserDefault.emailAddress }
                    ]
                },
                userErrors: []
            }
        });
    });

    it("should throw error if user is already assigned to program", async () => {
        const result: ExecutionResult = await gqlTest(MUTATION_ASSIGN_USER_TO_PROGRAM(fakeUserManager.id, {
            programId: fakeProgram.id,
            userId: fakeUserDefault.id
        }));
        expect(result.data).toBeDefined();
        expect(result.errors).toBeUndefined();

        const programData: any = result.data!.programAssignUser!;
        const userErrors: UserError[] = programData.userErrors!;
        expect(programData.program!).toBeNull();
        expect(Array.isArray(userErrors)).toBe(true);
        expect(errorContainsField(userErrors, "userId")).toBe(true);
    });

    afterAll(async () => {
        await connection.close();
    });
});