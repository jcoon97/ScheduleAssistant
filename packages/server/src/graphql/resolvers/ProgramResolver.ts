import { Arg, Args, Authorized, Mutation, Query, Resolver } from "type-graphql";
import { InjectRepository } from "typeorm-typedi-extensions";
import { Program } from "../../entities/Program";
import { RoleType, User } from "../../entities/User";
import { ProgramRepository } from "../../repositories/ProgramRepository";
import { UserRepository } from "../../repositories/UserRepository";
import { AssignUserProgramArgs } from "../args-types/AssignUserProgramArgs";
import { ProgramByIdArgs } from "../args-types/ProgramByIdArgs";
import { UserError } from "../errors/UserError";
import { CreateProgramInput } from "../input-types/CreateProgramInput";
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
        let program: Program = (await this.programRepository.findOne({ id: args.programId }))!;
        const user: User = (await this.userRepository.findOne({ id: args.userId }))!;
        const programUsers: User[] = await program.users;
        const userErrors: UserError[] = [];

        // Check that the user is not already present in the program
        if (programUsers.some((user: User) => user.id === args.userId)) {
            userErrors.push({
                field: [ "userId" ],
                message: "User is already assigned to the program."
            });
        }

        // Add the user to the program
        if (userErrors.length === 0) {
            programUsers.push(user);
            program = await this.programRepository.save(program);
        }

        return {
            program: userErrors.length === 0 ? program : undefined,
            userErrors
        };
    }

    @Authorized(RoleType.LA_MANAGER)
    @Mutation(() => CreateProgramPayload, {
        name: "programCreate",
        description: "Creates a new program."
    })
    async createProgram(@Arg("input") input: CreateProgramInput): Promise<CreateProgramPayload> {
        let program = this.programRepository.create({ ...input });
        program = await this.programRepository.save(program);

        return {
            program,
            userErrors: []
        };
    }

    @Authorized()
    @Query(() => Program, {
        name: "program",
        description: "Returns a Program entity by ID."
    })
    async getProgramById(@Args() args: ProgramByIdArgs): Promise<Program> {
        return (await this.programRepository.findOne({ id: args.id }))!;
    }
}