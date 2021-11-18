import { Arg, Args, Authorized, Mutation, Query, Resolver } from "type-graphql";
import { InjectRepository } from "typeorm-typedi-extensions";
import { AssignUserProgramArgs } from "../args-types/AssignUserProgramArgs";
import { ChangeProgramLeadManagerArgs } from "../args-types/ChangeProgramLeadManagerArgs";
import { ProgramByIdArgs } from "../args-types/ProgramByIdArgs";
import { Program } from "../entities/Program";
import { RoleType, User } from "../entities/User";
import { APIError, ErrorCode } from "../errors/APIError";
import { CreateProgramInput } from "../input-types/CreateProgramInput";
import { ProgramRepository } from "../repositories/ProgramRepository";
import { UserRepository } from "../repositories/UserRepository";

@Resolver(() => Program)
export class ProgramResolver {
    @InjectRepository(Program)
    private readonly programRepository!: ProgramRepository;

    @InjectRepository(User)
    private readonly userRepository!: UserRepository;

    @Authorized(RoleType.ADMIN)
    @Mutation(() => Program, {
        name: "programAssignUser",
        description: "Assigns a user to a program, if they are not already assigned."
    })
    async assignProgramUser(@Args() args: AssignUserProgramArgs): Promise<Program> {
        const program: Program = (await this.programRepository.findOne({ id: args.programId }))!;
        const user: User = (await this.userRepository.findOne({ id: args.userId }))!;
        const programUsers: User[] = await program.users;

        // Check that user is not already present in program
        if (programUsers.some((user: User) => user.id === args.userId)) {
            throw new APIError(ErrorCode.PROGRAM_USER_ALREADY_ASSIGNED, "User is already assigned to the program");
        }

        programUsers.push(user);
        return this.programRepository.save(program);
    }

    @Authorized(RoleType.ADMIN)
    @Mutation(() => Program, {
        name: "programChangeLeadOrManager",
        description: "Changes the program's lead or manager to a different user."
    })
    async changeProgramLeadOrManager(@Args() args: ChangeProgramLeadManagerArgs): Promise<Program> {
        const program: Program = (await this.programRepository.findOne({ id: args.programId }))!;
        const user: User = (await this.userRepository.findOne({ id: args.userId }))!;
        const programManager: User | undefined = await program.leadOrManager;

        // Check that specified user isn't already lead/manager of the program
        if (programManager?.id === user.id) {
            throw new APIError(ErrorCode.PROGRAM_USER_ALREADY_LEAD_MANAGER, "User is already assigned as program lead or manager");
        }

        program.leadOrManager = user;
        return this.programRepository.save(program);
    }

    @Authorized(RoleType.ADMIN)
    @Mutation(() => Program, {
        name: "programCreate",
        description: "Creates a new program."
    })
    async createProgram(@Arg("input") input: CreateProgramInput): Promise<Program> {
        const program = this.programRepository.create({ ...input });
        return this.programRepository.save(program);
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