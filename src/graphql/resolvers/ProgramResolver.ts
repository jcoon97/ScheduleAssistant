import { Arg, Args, Authorized, Mutation, Query, Resolver } from "type-graphql";
import { InjectRepository } from "typeorm-typedi-extensions";
import { Program } from "../../entities/Program";
import { RoleType, User } from "../../entities/User";
import { ProgramRepository } from "../../repositories/ProgramRepository";
import { UserRepository } from "../../repositories/UserRepository";
import { AssignUserProgramArgs, ProgramByIdArgs } from "../args-types/program";
import { ProgramDoesExist } from "../errors/checkers/entity-exists";
import { ProgramDoesNotExist, UserDoesNotExist } from "../errors/checkers/entity-not-exists";
import { IsNotUUID } from "../errors/checkers/uuid";
import { UserError } from "../errors/UserError";
import { UserErrorBuilder } from "../errors/UserErrorBuilder";
import { CreateProgramInput } from "../input-types/program";
import { AssignUserProgramPayload, CreateProgramPayload } from "../payloads/program";

@Resolver(() => Program)
export class ProgramResolver {
    @InjectRepository(Program)
    private readonly programRepository!: ProgramRepository;

    @InjectRepository(User)
    private readonly userRepository!: UserRepository;

    @Authorized(RoleType.LEAD_LA)
    @Mutation(() => AssignUserProgramPayload, {
        name: "programAssignUser",
        description: "Assigns a user to a program, if they are not already assigned."
    })
    async assignProgramUser(@Args() args: AssignUserProgramArgs): Promise<AssignUserProgramPayload> {
        const userErrors: UserError[] = await new UserErrorBuilder()
            .check([ "programId" ], IsNotUUID, { value: args.programId })
            .check([ "userId" ], IsNotUUID, { value: args.userId })
            .check([ "programId" ], ProgramDoesNotExist, { property: "id", value: args.programId })
            .check([ "userId" ], UserDoesNotExist, { property: "id", value: args.userId })
            .build();

        if (userErrors.length > 0) return { program: undefined, userErrors };

        let program: Program = (await this.programRepository.findOne({ id: args.programId }))!;
        const user: User = (await this.userRepository.findOne({ id: args.userId }))!;
        const programUsers: User[] = await program.users;

        if (programUsers.some((user: User) => user.id === args.userId)) {
            userErrors.push({
                field: [ "userId" ],
                message: "User is already assigned to the program."
            });
        }

        programUsers.push(user);
        program = await this.programRepository.save(program);
        return { program, userErrors };
    }

    @Authorized(RoleType.LA_MANAGER)
    @Mutation(() => CreateProgramPayload, {
        name: "programCreate",
        description: "Creates a new program."
    })
    async createProgram(@Arg("input") input: CreateProgramInput): Promise<CreateProgramPayload> {
        const userErrors: UserError[] = await new UserErrorBuilder()
            .check([ "input", "abbreviation" ], ProgramDoesExist, { property: "abbreviation", value: input.abbreviation })
            .check([ "input", "name" ], ProgramDoesExist, { property: "name", value: input.name })
            .build();

        if (userErrors.length > 0) return { program: undefined, userErrors };

        let program: Program = this.programRepository.create({ ...input });
        program = await this.programRepository.save(program);
        return { program, userErrors };
    }

    @Authorized()
    @Query(() => Program, {
        name: "program",
        description: "Returns a Program entity by ID.",
        nullable: true
    })
    async getProgramById(@Args() args: ProgramByIdArgs): Promise<Program | undefined> {
        const userErrors: UserError[] = await new UserErrorBuilder()
            .check([ "id" ], ProgramDoesNotExist, { property: "id", value: args.id })
            .build();

        if (userErrors.length > 0) return undefined;
        return (await this.programRepository.findOne({ id: args.id }))!;
    }
}